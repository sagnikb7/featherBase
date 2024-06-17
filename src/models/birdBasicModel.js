import mongoose from 'mongoose';
import BaseRepository from './baseRepository.js';

const NAME = 'birds';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    scientificName: { type: String, required: true },
    serialNumber: { type: Number, min: 1 },
    hash: { type: String, required: true },
    iucnStatus: {
      type: String,
      enum: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'],
      required: true,
    },
    habitat: { type: [String] },
    distributionRangeSize: { type: String, required: true },
    bestSeenAt: { type: String },
    migrationStatus: { type: String, required: true },
    order: { type: String },
    family: { type: String },
    commonGroup: { type: String },
    rarity: { type: Number, min: 1, max: 5 },
    identification: { type: String },
    colors: { type: String },
    size: { type: String, enum: ['small', 'medium', 'large', 'tiny'] },
    sizeRange: { type: String },
    diet: { type: [String] },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

class BirdModel extends BaseRepository {
  constructor() {
    super(mongoose.model(NAME, schema));
  }
}

const birdBasicModel = new BirdModel();

export default birdBasicModel;
