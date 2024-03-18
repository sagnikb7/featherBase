import birdModel from '#models/birdBasicModel.js';

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  return data;
};

// eslint-disable-next-line import/prefer-default-export
export { getBirdById };
