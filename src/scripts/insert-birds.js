/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
import path from 'path';
import { readFile } from 'fs/promises';
import { birdBasicModel } from '#models/birdBasicModel.js';

const BirdSchema = birdBasicModel;

const insertBirds = async () => {
  try {
    const files = [];
    for (let i = 1; i <= 2; i += 1) { files.push(`${i}.json`); }

    for (const f of files) {
      console.log(`\n\nReading ${f} \n`);

      const batchNumber = Number(f.split('.json')[0]);
      const fileContents = await readFile((path.join(process.cwd(), `/birdJSON/${f}`)), 'utf8');
      let counter = 0;

      for (const fc of JSON.parse(fileContents)) {
        counter += 1;
        console.log(`inserting ${fc.Name} -->`);

        const bird = {
          name: fc.Name,
          serialNumber: ((batchNumber - 1) * 5) + counter,
          scientificName: fc['Scientific name'],
          iucnStatus: fc['IUCN status'],
          habitat: fc.Habitat.split(',').map((c) => c.trim().toLowerCase()).sort(),
          distributionRangeSize: fc['Distribution Range Size'].toLowerCase(),
          bestSeenAt: fc['Best seen at'],
          migrationStatus: fc['Migration status'].toLowerCase(),
          familyOfBird: fc['Family of bird'].toLowerCase(),
          rarity: Number.parseInt(fc.Rarity, 10),
          identification: fc['How to identify'],
          colors: fc['Primary colors'].split(',').map((c) => c.trim().toLowerCase()).sort(),
          size: fc['Size of the bird'].toLowerCase(),
          diet: fc.Diet.split(',').map((c) => c.trim().toLowerCase()).sort(),
        };

        const oldRecord = await BirdSchema.findOne({ scientificName: fc['Scientific name'] });
        if (oldRecord) {
          console.log('record already present');
          return false;
        }

        const b = new BirdSchema(bird);
        const resp = await b.save();
        console.log(' ', resp._id);
      }
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};

export default insertBirds;
