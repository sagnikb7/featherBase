/* eslint-disable no-console */

/**
 * verify-birds.js
 *
 * Cross-references our bird DB records against the eBird taxonomy CSV and:
 *   - Sets speciesCode on each bird
 *   - Verifies / corrects scientificName, order, family, commonGroup
 *   - Writes a structured verification tag into the `verification` field
 *   - Produces a JSON log file in DataCollector/logs/
 *
 * Usage:
 *   node src/scripts/verify-birds.js "[23,56,67]"    -- explicit list
 *   node src/scripts/verify-birds.js "34-67"         -- inclusive range
 */

import path from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import mongoose from 'mongoose';

import birdBasicModel from '#models/birdBasicModel.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const CSV_PATH = path.join(process.cwd(), 'DataCollector/ebird.csv');
const LOG_DIR = path.join(process.cwd(), 'DataCollector/logs');

const TODAY = new Date().toISOString().split('T')[0]; // "2026-04-23"

// ─── Input parsing ────────────────────────────────────────────────────────────

/**
 * Parses the CLI argument into an array of serial numbers.
 * Accepts two forms:
 *   - Range string  "34-67"   → [34, 35, ..., 67]
 *   - JSON array    "[23,56]" → [23, 56]
 */
function parseInput(raw) {
  if (!raw) throw new Error('No input provided. Pass a range ("34-67") or array ("[23,56,67]").');

  const trimmed = raw.trim();

  // Detect range: digits - digits, no brackets
  const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const left = parseInt(rangeMatch[1], 10);
    const right = parseInt(rangeMatch[2], 10);

    if (left >= right) {
      throw new Error(`Invalid range "${trimmed}": left value must be strictly less than right value.`);
    }
    if (left < 1) throw new Error(`Invalid range "${trimmed}": values must be positive integers.`);

    const result = [];
    for (let i = left; i <= right; i += 1) result.push(i);
    return result;
  }

  // Detect array: starts with [
  if (trimmed.startsWith('[')) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(`Invalid array format: "${trimmed}". Example: "[23,56,67]"`);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Array must have at least one element.');
    }

    for (const item of parsed) {
      if (!Number.isInteger(item) || item < 1) {
        throw new Error(`Invalid serial number "${item}": must be a positive integer.`);
      }
    }

    return [...new Set(parsed)].sort((a, b) => a - b); // deduplicate and sort
  }

  throw new Error(
    `Unrecognised input format: "${trimmed}". Use a range ("34-67") or a JSON array ("[23,56,67]").`,
  );
}

// ─── CSV loading ──────────────────────────────────────────────────────────────

/**
 * Splits a single CSV line into fields, correctly handling RFC-4180 quoted fields
 * that may contain commas (e.g. "Ducks, Geese, and Waterfowl").
 */
function splitCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1; // escaped quote ""
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parses the eBird CSV into two lookup Maps:
 *   scientificNameMap  → keyed by lowercase scientific name
 *   commonNameMap      → keyed by lowercase common name, only "species" category rows
 *
 * Returns { scientificNameMap, commonNameMap }
 */
async function loadCsv() {
  const raw = await readFile(CSV_PATH, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim());

  // First line is the header
  const headers = splitCsvLine(lines[0]);

  const idxOf = (col) => {
    const i = headers.indexOf(col);
    if (i === -1) throw new Error(`CSV missing expected column: ${col}`);
    return i;
  };

  const COL = {
    scientificName: idxOf('SCIENTIFIC_NAME'),
    commonName: idxOf('COMMON_NAME'),
    speciesCode: idxOf('SPECIES_CODE'),
    category: idxOf('CATEGORY'),
    order: idxOf('ORDER'),
    familyComName: idxOf('FAMILY_COM_NAME'),
    familySciName: idxOf('FAMILY_SCI_NAME'),
  };

  const scientificNameMap = new Map();
  const commonNameMap = new Map();

  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < headers.length) continue; // malformed line

    const row = {
      scientificName: cols[COL.scientificName]?.trim() || '',
      commonName: cols[COL.commonName]?.trim() || '',
      speciesCode: cols[COL.speciesCode]?.trim() || '',
      category: cols[COL.category]?.trim() || '',
      order: cols[COL.order]?.trim() || '',
      familyComName: cols[COL.familyComName]?.trim() || '',
      familySciName: cols[COL.familySciName]?.trim() || '',
    };

    if (row.scientificName) {
      scientificNameMap.set(row.scientificName.toLowerCase(), row);
    }

    // Only index by common name when the row is a true species entry
    if (row.commonName && row.category === 'species') {
      commonNameMap.set(row.commonName.toLowerCase(), row);
    }
  }

  console.log(`CSV loaded: ${scientificNameMap.size} scientific names, ${commonNameMap.size} species common names`);
  return { scientificNameMap, commonNameMap };
}

// ─── Log helpers ──────────────────────────────────────────────────────────────

/** Creates a fresh per-bird log entry shell. */
function makeBirdLog(bird) {
  return {
    serialNumber: bird.serialNumber,
    name: bird.name,
    scientificName: bird.scientificName,
    runTimestamp: new Date().toISOString(),
    matchMethod: null,      // "scientificName" | "commonName" | "failed"
    matchedCsvRow: null,    // the matched CSV row (for traceability)
    operations: [],         // array of { field, action, ...details }
  };
}

/** Appends an operation record to the bird log entry. */
function logOp(entry, op) {
  entry.operations.push({ timestamp: new Date().toISOString(), ...op });
}

// ─── DB update helper ─────────────────────────────────────────────────────────

/**
 * Applies a $set patch to the bird using dot-notation for the verification
 * sub-document so sibling keys are never overwritten.
 */
async function applyPatch(serialNumber, patch) {
  const $set = {};

  for (const [key, value] of Object.entries(patch)) {
    if (key === 'verification' && typeof value === 'object') {
      // Expand into dot-notation so we only touch the sub-keys we specify
      for (const [subKey, subValue] of Object.entries(value)) {
        $set[`verification.${subKey}`] = subValue;
      }
    } else {
      $set[key] = value;
    }
  }

  await birdBasicModel.update({ serialNumber }, { $set });
}

// ─── Per-bird processing ──────────────────────────────────────────────────────

async function processBird(bird, scientificNameMap, commonNameMap) {
  const entry = makeBirdLog(bird);
  const patch = {};

  // 1. CSV lookup: try scientific name first
  let csvRow = scientificNameMap.get(bird.scientificName?.toLowerCase());
  if (csvRow && csvRow.category === 'species') {
    entry.matchMethod = 'scientificName' 
  } else {
    // Fallback: common name lookup (only species rows)
    csvRow = commonNameMap.get(bird.name?.toLowerCase());
    if (csvRow && csvRow.category === 'species') {
      entry.matchMethod = 'commonName';

      // If matched via common name, we need to update scientificName in DB
      if (csvRow.scientificName && csvRow.scientificName !== bird.scientificName) {
        logOp(entry, {
          field: 'scientificName',
          action: 'corrected',
          oldValue: bird.scientificName,
          newValue: csvRow.scientificName,
          reason: 'matched via common name; adopting CSV scientific name',
        });
        patch.scientificName = csvRow.scientificName;
      }
    } else {
      entry.matchMethod = 'failed';
      logOp(entry, {
        field: 'match',
        action: 'failed',
        reason: 'No match in CSV by scientific name or common name (species category)',
      });
      return entry; // nothing more to do
    }
  }

  // Store the matched CSV row for traceability (strip empty fields)
  entry.matchedCsvRow = Object.fromEntries(
    Object.entries(csvRow).filter(([, v]) => v !== ''),
  );

  // 2. speciesCode — always set / upsert from CSV
  if (csvRow.speciesCode && csvRow.speciesCode !== bird.speciesCode) {
    logOp(entry, {
      field: 'speciesCode',
      action: bird.speciesCode ? 'updated' : 'set',
      oldValue: bird.speciesCode || null,
      newValue: csvRow.speciesCode,
    });
    patch.speciesCode = csvRow.speciesCode;
  } else if (csvRow.speciesCode) {
    logOp(entry, { field: 'speciesCode', action: 'unchanged', value: csvRow.speciesCode });
  }

  // 3. verification.scientificName
  const existingVerification = bird.verification || {};
  if (!existingVerification.scientificName?.verified) {
    logOp(entry, { field: 'verification.scientificName', action: 'verified', date: TODAY });
    patch.verification = { ...patch.verification, scientificName: { verified: true, date: TODAY } };
  } else {
    logOp(entry, {
      field: 'verification.scientificName',
      action: 'already_verified',
      date: existingVerification.scientificName.date,
    });
  }

  // 4. order — verify and log mismatch if any
  if (csvRow.order) {
    const dbOrder = bird.order?.trim().toLowerCase();
    const csvOrder = csvRow.order.trim().toLowerCase();

    if (dbOrder === csvOrder) {
      if (!existingVerification.order?.verified) {
        logOp(entry, { field: 'verification.order', action: 'verified', date: TODAY });
        patch.verification = { ...patch.verification, order: { verified: true, date: TODAY } };
      } else {
        logOp(entry, {
          field: 'verification.order',
          action: 'already_verified',
          date: existingVerification.order.date,
        });
      }
    } else {
      // Mismatch — log it, do NOT silently overwrite; human review needed
      logOp(entry, {
        field: 'order',
        action: 'mismatch',
        dbValue: bird.order,
        csvValue: csvRow.order,
        note: 'verification NOT set; manual review required',
      });
      patch.verification = {
        ...patch.verification,
        order: {
          verified: false,
          mismatch: { db: bird.order, csv: csvRow.order },
          date: TODAY,
        },
      };
    }
  }

  // 5. family — verify against FAMILY_SCI_NAME
  if (csvRow.familySciName) {
    const dbFamily = bird.family?.trim().toLowerCase();
    const csvFamily = csvRow.familySciName.trim().toLowerCase();

    if (dbFamily === csvFamily) {
      if (!existingVerification.family?.verified) {
        logOp(entry, { field: 'verification.family', action: 'verified', date: TODAY });
        patch.verification = { ...patch.verification, family: { verified: true, date: TODAY } };
      } else {
        logOp(entry, {
          field: 'verification.family',
          action: 'already_verified',
          date: existingVerification.family.date,
        });
      }
    } else {
      // CSV is the source of truth — correct the DB value and mark verified
      logOp(entry, {
        field: 'family',
        action: 'corrected',
        oldValue: bird.family,
        newValue: csvRow.familySciName,
        reason: 'CSV FAMILY_SCI_NAME is authoritative',
      });
      patch.family = csvRow.familySciName;
      patch.verification = {
        ...patch.verification,
        family: { verified: true, date: TODAY },
      };
    }
  }

  // 6. commonGroup — sync from FAMILY_COM_NAME, preserving original CSV casing
  if (csvRow.familyComName) {
    const csvGroup = csvRow.familyComName; // keep original casing ("Ducks, Geese, and Waterfowl")
    if (csvGroup !== bird.commonGroup) {
      logOp(entry, {
        field: 'commonGroup',
        action: bird.commonGroup ? 'corrected' : 'set',
        oldValue: bird.commonGroup || null,
        newValue: csvGroup,
        reason: 'CSV FAMILY_COM_NAME is authoritative',
      });
      patch.commonGroup = csvGroup;
      patch.verification = {
        ...patch.verification,
        commonGroup: { verified: true, date: TODAY },
      };
    } else {
      if (!existingVerification.commonGroup?.verified) {
        logOp(entry, { field: 'verification.commonGroup', action: 'verified', date: TODAY });
        patch.verification = { ...patch.verification, commonGroup: { verified: true, date: TODAY } };
      } else {
        logOp(entry, {
          field: 'verification.commonGroup',
          action: 'already_verified',
          date: existingVerification.commonGroup.date,
        });
      }
    }
  }

  // 7. Persist all collected changes in one DB call
  if (Object.keys(patch).length > 0) {
    await applyPatch(bird.serialNumber, patch);
    logOp(entry, { field: 'db', action: 'patched', fields: Object.keys(patch) });
  } else {
    logOp(entry, { field: 'db', action: 'no_changes' });
  }

  return entry;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const rawArg = process.argv[2];
  let serialNumbers;

  try {
    serialNumbers = parseInput(rawArg);
  } catch (err) {
    console.error(`[input error] ${err.message}`);
    process.exit(1);
  }

  const first = serialNumbers[0];
  const last = serialNumbers[serialNumbers.length - 1];
  console.log(`Processing ${serialNumbers.length} birds: ${first} → ${last}`);

  // Connect to MongoDB
  const mongoURI = process.env.MONGO_DB;
  if (!mongoURI) {
    console.error('[error] MONGO_DB environment variable is not set.');
    process.exit(1);
  }

  await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 30_000 });
  console.log('MongoDB connected');

  const { scientificNameMap, commonNameMap } = await loadCsv();

  const runLog = {
    runId: `verify-${Date.now()}`,
    startedAt: new Date().toISOString(),
    input: rawArg,
    totalRequested: serialNumbers.length,
    results: {
      matched_scientific: 0,
      matched_common: 0,
      failed: 0,
    },
    birds: [],
  };

  for (const serial of serialNumbers) {
    process.stdout.write(`  [${serial}] `);

    const [bird] = await birdBasicModel.get({ serialNumber: serial });
    if (!bird) {
      console.log(`not found in DB — skipped`);
      runLog.birds.push({
        serialNumber: serial,
        runTimestamp: new Date().toISOString(),
        matchMethod: 'not_in_db',
        operations: [],
      });
      continue;
    }

    const entry = await processBird(bird, scientificNameMap, commonNameMap);
    runLog.birds.push(entry);

    if (entry.matchMethod === 'scientificName') runLog.results.matched_scientific += 1;
    else if (entry.matchMethod === 'commonName') runLog.results.matched_common += 1;
    else runLog.results.failed += 1;

    console.log(`${bird.name} → ${entry.matchMethod} (${entry.operations.length} ops)`);
  }

  runLog.finishedAt = new Date().toISOString();

  // Write log file
  await mkdir(LOG_DIR, { recursive: true });
  const logFile = path.join(LOG_DIR, `verify-${Date.now()}.json`);
  await writeFile(logFile, JSON.stringify(runLog, null, 2), 'utf8');

  console.log(`\nDone.`);
  console.log(`  matched by scientific name : ${runLog.results.matched_scientific}`);
  console.log(`  matched by common name     : ${runLog.results.matched_common}`);
  console.log(`  failed / not matched       : ${runLog.results.failed}`);
  console.log(`  log written to             : ${logFile}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[fatal]', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
