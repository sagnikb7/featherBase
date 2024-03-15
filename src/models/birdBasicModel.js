import mongoose from 'mongoose';

const NAME = 'base';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    scientificName: { type: String, required: true },
    serialNumber: { type: Number, min: 1 },
    iucnStatus: {
      type: String,
      enum: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'],
      required: true,
    },
    habitat: { type: [String] },
    distributionRangeSize: { type: String, required: true },
    bestSeenAt: { type: String },
    migrationStatus: { type: String, required: true },
    familyOfBird: { type: String },
    rarity: { type: Number, min: 1, max: 5 },
    identification: { type: String },
    colors: { type: [String] },
    size: { type: String, enum: ['small', 'medium', 'large', 'tiny'] },
    diet: { type: [String] },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

const birdBasicModel = mongoose.model(NAME, schema);

// eslint-disable-next-line import/prefer-default-export
export { birdBasicModel };
