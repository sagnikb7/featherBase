import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  const [metaData] = await metaModel.get({ serialNumber: id });
  return { ...data, meta: { images: metaData.images } };
};

// eslint-disable-next-line import/prefer-default-export
export { getBirdById };
