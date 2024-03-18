/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
import path from 'path';
import { readFile } from 'fs/promises';
import birdBasicModel from '#models/birdBasicModel.js';

const START_FILE = 1;
const END_FILE = 10;
const BATCH_SIZE = 10;

const BirdSchema = birdBasicModel;

const makeArray = (rawText) => {
  const a = rawText.split(',')
    .map((c) => c.replace(' and ', '').trim().toLowerCase())
    .filter((c1) => c1)
    .sort();
  return a;
};

const insertBirds = async () => {
  try {
    const files = [];
    for (let i = START_FILE; i <= END_FILE; i += 1) { files.push(`${i}.json`); }

    for (const f of files) {
      console.log(`\n\nReading ${f} \n`);

      const batchNumber = Number(f.split('.json')[0]);
      const fileContents = await readFile((path.join(process.cwd(), `/birdJSON/${f}`)), 'utf8');
      let counter = 0;

      for (const fc of JSON.parse(fileContents)) {
        counter += 1;

        const bird = {
          name: fc.Name,
          serialNumber: ((batchNumber - 1) * BATCH_SIZE) + counter,
          scientificName: fc.Scientific_Name,
          iucnStatus: fc.IUCN_status,
          habitat: makeArray(fc.Habitat),
          distributionRangeSize: fc.Distribution_Range_Size.toLowerCase(),
          bestSeenAt: fc.Best_seen_at,
          migrationStatus: fc.Migration_status.toLowerCase(),
          family: fc.Family,
          order: fc.Order,
          commonGroup: fc.common_grouping.toLowerCase(),
          rarity: Number.parseInt(fc.Rarity, 10),
          identification: fc['How to identify'],
          colors: fc.Primary_colors_of_the_bird,
          size: fc.Size_of_the_bird.split(',')[0].trim().toLowerCase(),
          sizeRange: fc.Size_of_the_bird.split(',')[1].trim().toLowerCase(),
          diet: makeArray(fc.Diet),
        };
        console.log(`inserting ${fc.Name} -->`, JSON.stringify(bird, null, 4));
        const oldRecord = await BirdSchema.getOne({ scientificName: fc.Scientific_Name });
        if (oldRecord) {
          console.log('record already present');
          return false;
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
