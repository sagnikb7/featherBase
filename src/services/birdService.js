import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  const [metaData] = await metaModel.get({ serialNumber: id });
  return { ...data, meta: { images: metaData?.images || [] } };
};

const getAllBirds = async () => {
  const birds = await birdModel.get(
    {},
    { serialNumber: 1 },
    { serialNumber: 1, name: 1, scientificName: 1 },
  );

  const birdMetaMap = {};
  const birdMetas = await metaModel.get({}, null, { serialNumber: 1, images: 1 });

  birdMetas.forEach((m) => { birdMetaMap[m.serialNumber] = { images: m.images }; });

  return birds.map((b) => ({
    id: b.serialNumber,
    name: b.name,
    scientificName: b.scientificName,
    image: birdMetaMap[b.serialNumber]?.images[0] || '',
  }));
};

// eslint-disable-next-line import/prefer-default-export
export { getBirdById, getAllBirds };
