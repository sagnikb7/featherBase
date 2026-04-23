/* eslint-disable no-console */
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import birdBasicModel from '#models/birdBasicModel.js';
import { generateMD5Hash } from '#utils/common.js';

const BATCH_SIZE = 10;

const BirdSchema = birdBasicModel;

function parseInput(raw) {
  if (!raw) throw new Error('No input provided. Pass a range ("34-67") or array ("[23,56,67]").');

  const trimmed = raw.trim();

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
      throw new Error(`Invalid array format: "${trimmed}". Example: "[23,56,67]"`);
    }
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Array must have at least one element.');
    for (const item of parsed) {
      if (!Number.isInteger(item) || item < 1)
        throw new Error(`Invalid file number "${item}": must be a positive integer.`);
    }
    return [...new Set(parsed)].sort((a, b) => a - b);
  }

  throw new Error(`Unrecognised input: "${trimmed}". Use a range ("34-67") or array ("[23,56,67]").`);
}

const makeArray = (rawText) => {
  const a = rawText.split(',')
    .map((c) => c.replace(' and ', '').trim().toLowerCase())
    .filter((c1) => c1);
  return a;
};

const insertBirds = async (fileNumbers) => {
  try {
    for (const batchNumber of fileNumbers) {
      const f = `${batchNumber}.json`;
      console.log(`\n\nReading ${f} \n`);

      const fileContents = await readFile((path.join(process.cwd(), `/data/birds/${f}`)), 'utf8');
      let counter = 0;

      for (const fc of JSON.parse(fileContents)) {
        counter += 1;

        const bird = {
          name: fc.Name,
          serialNumber: ((batchNumber - 1) * BATCH_SIZE) + counter,
          scientificName: fc.Scientific_Name,
          hash: generateMD5Hash(fc.Scientific_Name),
          iucnStatus: fc.IUCN_status,
          habitat: makeArray(fc.Habitat),
          distributionRangeSize: fc.Distribution_Range_Size.toLowerCase(),
          bestSeenAt: fc.Best_seen_at,
          migrationStatus: fc.Migration_status.toLowerCase(),
          family: fc.Family,
          order: fc.Order,
          commonGroup: fc.common_grouping.toLowerCase(),
          rarity: Number.parseInt(fc.Rarity, 10),
          identification: fc.How_to_identify,
          colors: fc.Primary_colors_of_the_bird,
          size: fc.Size_of_the_bird.split(',')[0].trim().toLowerCase(),
          sizeRange: fc.Size_of_the_bird.split(',')[1].trim().toLowerCase(),
          diet: makeArray(fc.Diet),
        };
        console.log(`inserting --> ${fc.Name}`);
        const oldRecord = await BirdSchema.getOne({ scientificName: fc.Scientific_Name });
        if (oldRecord) {
          console.log('record already present, skipping');
          // eslint-disable-next-line no-continue
          continue;
        }

        const resp = await BirdSchema.create(bird);
        console.log(' ', resp._id);
      }
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};

export default insertBirds;

// ESM equivalent of `require.main === module` — only runs when executed directly,
// not when imported by another module (e.g. a future re-enable in routes/index.js).
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

  console.log(`File batches to insert: ${fileNumbers.join(', ')}`);

  mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 30_000 })
    .then(() => {
      console.log('MongoDB connected');
      return insertBirds(fileNumbers);
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
