/* eslint-disable no-console */
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import birdBasicModel from '#models/birdBasicModel.js';

const migratebestSeenAt = async () => {
  // Find all records where bestSeenAt is still stored as a plain string (legacy shape).
  // After schema change to [String], Mongoose returns strings as single-element arrays,
  // so we detect legacy records by checking for the comma separator inside the first element.
  const birds = await birdBasicModel.get({});

  let updated = 0;
  let skipped = 0;

  for (const bird of birds) {
    const raw = bird.bestSeenAt;

    // Already an array of length > 1, or a single clean value with no comma — nothing to split.
    if (!raw || (Array.isArray(raw) && (raw.length !== 1 || !raw[0].includes(',')))) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // Legacy: single string like "Kaziranga National Park, Sundarbans, Western Ghats"
    const source = Array.isArray(raw) ? raw[0] : raw;
    const parts = source.split(',').map((s) => s.trim()).filter(Boolean);

    await birdBasicModel.update({ _id: bird._id }, { $set: { bestSeenAt: parts } });
    console.log(`  [updated] #${bird.serialNumber} ${bird.name} → [${parts.join(' | ')}]`);
    updated += 1;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already clean): ${skipped}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mongoURI = process.env.MONGO_DB;
  if (!mongoURI) {
    console.error('[error] MONGO_DB environment variable is not set.');
    process.exit(1);
  }

  mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 30_000 })
    .then(() => {
      console.log('MongoDB connected\nMigrating bestSeenAt string → [String]...\n');
      return migratebestSeenAt();
    })
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error('[fatal]', err);
      mongoose.disconnect().finally(() => process.exit(1));
    });
}
