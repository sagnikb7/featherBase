/* eslint-disable no-console */
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir } from 'fs/promises';
import mongoose from 'mongoose';
import birdBasicModel from '#models/birdBasicModel.js';
import { generateMD5Hash } from '#utils/common.js';

// Fields skipped on update — eBird-verified via verify-birds.js
const SKIP_ON_UPDATE = new Set([
  'order', 'family', 'commonGroup', 'scientificName', 'name', 'serialNumber', 'hash', 'speciesCode', 'verification',
]);

// All keys that must be present in each JSON record (optional fields may be null but key must exist)
const REQUIRED_KEYS = [
  'Name', 'Scientific_Name', 'IUCN_status', 'Habitat', 'Distribution_Range_Size',
  'Best_seen_at', 'Migration_status', 'Order', 'Family', 'Common_grouping',
  'Rarity', 'How_to_identify', 'Primary_colors_of_the_bird', 'Size_of_the_bird', 'Diet',
];

function validateRecord(fc) {
  const missing = REQUIRED_KEYS.filter((k) => !(k in fc));
  if (missing.length > 0) throw new Error(`Missing keys: ${missing.join(', ')}`);
}

function parseInput(raw) {
  if (!raw) throw new Error('No input provided. Pass a range ("48-50") or array ("[48,49]").');

  const trimmed = raw.trim();

  const singleMatch = trimmed.match(/^(\d+)$/);
  if (singleMatch) {
    const n = parseInt(singleMatch[1], 10);
    if (n < 1) throw new Error(`Invalid file number "${trimmed}": must be a positive integer.`);
    return [n];
  }

  const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const left = parseInt(rangeMatch[1], 10);
    const right = parseInt(rangeMatch[2], 10);
    if (left >= right) throw new Error(`Invalid range "${trimmed}": left must be less than right.`);
    if (left < 1) throw new Error(`Invalid range "${trimmed}": values must be positive integers.`);
    const result = [];
    for (let i = left; i <= right; i += 1) result.push(i);
    return result;
  }

  if (trimmed.startsWith('[')) {
    let parsed;
    try { parsed = JSON.parse(trimmed); } catch {
      throw new Error(`Invalid array format: "${trimmed}". Example: "[48,49]"`);
    }
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Array must have at least one element.');
    for (const item of parsed) {
      if (!Number.isInteger(item) || item < 1)
        throw new Error(`Invalid file number "${item}": must be a positive integer.`);
    }
    return [...new Set(parsed)].sort((a, b) => a - b);
  }

  throw new Error(`Unrecognised input: "${trimmed}". Use a range ("48-50") or array ("[48,49]").`);
}

function currentVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

function mapBirdV2(fc) {
  return {
    name: fc.Name,
    scientificName: fc.Scientific_Name,
    hash: generateMD5Hash(fc.Scientific_Name),
    iucnStatus: fc.IUCN_status,
    habitat: Array.isArray(fc.Habitat)
      ? fc.Habitat.map((h) => h.trim().toLowerCase())
      : fc.Habitat.split(',').map((h) => h.trim().toLowerCase()),
    distributionRangeSize: fc.Distribution_Range_Size.toLowerCase(),
    bestSeenAt: Array.isArray(fc.Best_seen_at)
      ? fc.Best_seen_at.map((s) => s.trim())
      : fc.Best_seen_at.split(',').map((s) => s.trim()),
    migrationStatus: fc.Migration_status.toLowerCase(),
    seasonalityInIndia: fc.Seasonality_in_India?.toLowerCase() ?? null,
    order: fc.Order,
    family: fc.Family,
    commonGroup: fc.Common_grouping,
    rarity: Number.parseInt(fc.Rarity, 10),
    identification: fc.How_to_identify,
    colors: fc.Primary_colors_of_the_bird,
    size: fc.Size_of_the_bird?.category?.toLowerCase() ?? null,
    lengthCm: fc.Size_of_the_bird?.length_cm ?? null,
    weightG: fc.Weight_g ?? null,
    wingspanCm: fc.Wingspan_cm ?? null,
    callDescription: fc.Call_description ?? null,
    juvenileDescription: fc.Juvenile_description ?? null,
    similarSpecies: Array.isArray(fc.Similar_species_in_India) ? fc.Similar_species_in_India : [],
    diet: Array.isArray(fc.Diet)
      ? fc.Diet.map((d) => d.trim().toLowerCase())
      : fc.Diet.split(',').map((d) => d.trim().toLowerCase()),
    version: currentVersion(),
  };
}

function buildUpdatePayload(mapped) {
  const update = {};
  for (const [key, value] of Object.entries(mapped)) {
    if (SKIP_ON_UPDATE.has(key)) continue;
    if (value === null || value === undefined) continue;
    update[key] = value;
  }
  return update;
}

// Batch N covers serials (N-1)*10+1 … N*10. Position i (0-indexed) within the batch maps to
// serial (N-1)*10 + i + 1, so serial numbers are fully deterministic from file name + position.
function expectedSerial(fileNumber, index) {
  return (fileNumber - 1) * 10 + index + 1;
}

const upsertBirds = async (fileNumbers) => {
  const log = { version: currentVersion(), files: [] };

  for (const fileNumber of fileNumbers) {
    const f = `${fileNumber}.json`;
    console.log(`\n\nReading data/birdsV2/${f}\n`);

    const fileContents = await readFile(path.join(process.cwd(), `data/birdsV2/${f}`), 'utf8');
    const birds = JSON.parse(fileContents);
    const fileLog = { file: f, results: [] };

    for (let index = 0; index < birds.length; index += 1) {
      const fc = birds[index];
      const serial = expectedSerial(fileNumber, index);

      try {
        validateRecord(fc);
      } catch (err) {
        console.log(`  [invalid] #${serial} ${fc.Name ?? '(unnamed)'} — ${err.message}`);
        fileLog.results.push({ name: fc.Name, serialNumber: serial, outcome: 'invalid', error: err.message });
        continue; // eslint-disable-line no-continue
      }

      const mapped = mapBirdV2(fc);
      console.log(`Processing → ${fc.Name} (expected #${serial})`);

      const existing = await birdBasicModel.getOne({ scientificName: fc.Scientific_Name });

      if (existing) {
        const updatePayload = buildUpdatePayload(mapped);
        await birdBasicModel.update({ _id: existing._id }, { $set: updatePayload });
        console.log(`  [updated] #${existing.serialNumber}`);
        fileLog.results.push({
          name: fc.Name, scientificName: fc.Scientific_Name, outcome: 'updated',
          serialNumber: existing.serialNumber, fieldsUpdated: Object.keys(updatePayload),
        });
      } else {
        // Scientific name not found — check if the expected serial slot is already occupied
        const bySerial = await birdBasicModel.getOne({ serialNumber: serial });

        if (bySerial) {
          const verified = bySerial.verification?.scientificName?.verified === true;
          const outcome = verified ? 'name_mismatch_verified' : 'name_mismatch_unverified';
          const tag = verified ? ' — eBird-verified' : '';
          // Still apply non-taxonomic enrichment fields; skip name/scientific name/taxonomic keys
          const updatePayload = buildUpdatePayload(mapped);
          await birdBasicModel.update({ _id: bySerial._id }, { $set: updatePayload });
          console.log(`  [${outcome}] #${serial} DB:"${bySerial.scientificName}"${tag}`);
          console.log(`    JSON:"${fc.Scientific_Name}" — enrichment applied`);
          fileLog.results.push({
            name: fc.Name,
            scientificName: fc.Scientific_Name,
            outcome,
            serialNumber: serial,
            dbName: bySerial.name,
            dbScientificName: bySerial.scientificName,
            fieldsUpdated: Object.keys(updatePayload),
            note: verified
              ? 'DB scientificName eBird-verified; JSON is a synonym — enrichment applied, name not overwritten'
              : 'Serial slot occupied, unverified — enrichment applied, manual name review needed',
          });
        } else {
          const newBird = { ...mapped, serialNumber: serial };
          const created = await birdBasicModel.create(newBird);
          console.log(`  [created] #${serial} _id=${created._id}`);
          fileLog.results.push({
            name: fc.Name, scientificName: fc.Scientific_Name, outcome: 'created', serialNumber: serial,
          });
        }
      }
    }

    log.files.push(fileLog);
  }

  // Write structured log
  const logsDir = path.join(process.cwd(), 'DataCollector/logs');
  await mkdir(logsDir, { recursive: true });
  const logPath = path.join(logsDir, `upsert-v2-${Date.now()}.json`);
  await writeFile(logPath, JSON.stringify(log, null, 2), 'utf8');
  console.log(`\nLog written → ${logPath}`);

  return log;
};

export default upsertBirds;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mongoURI = process.env.MONGO_DB;
  if (!mongoURI) {
    console.error('[error] MONGO_DB environment variable is not set.');
    process.exit(1);
  }

  let fileNumbers;
  try {
    fileNumbers = parseInput(process.argv[2]);
  } catch (err) {
    console.error(`[error] ${err.message}`);
    process.exit(1);
  }

  console.log(`Files to upsert: ${fileNumbers.join(', ')}`);

  mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 30_000 })
    .then(() => {
      console.log('MongoDB connected');
      return upsertBirds(fileNumbers);
    })
    .then(() => {
      console.log('Done.');
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error('[fatal]', err);
      mongoose.disconnect().finally(() => process.exit(1));
    });
}
