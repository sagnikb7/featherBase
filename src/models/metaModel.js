import mongoose from 'mongoose';
import BaseRepository from './baseRepository.js';

const NAME = 'meta';

const schema = new mongoose.Schema(
  {
    serialNumber: { type: Number, min: 1 },
    images: [{ type: mongoose.Schema.Types.Mixed }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

class MetaModel extends BaseRepository {
  constructor() {
    super(mongoose.model(NAME, schema, NAME));
  }
}

const metaModel = new MetaModel();

export default metaModel;
