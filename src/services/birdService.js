import NodeCache from 'node-cache';
import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  const [metaData] = await metaModel.get({ serialNumber: id });
  return { ...data, meta: { images: metaData?.images || [] } };
};

const getAllBirds = async ({ page = 1, size = 10, family, group, order } = {}) => {
  const filter = {};
  if (family) filter.family = { $regex: new RegExp(`^${family}$`, 'i') };
  if (group) filter.commonGroup = { $regex: new RegExp(`^${group}$`, 'i') };
  if (order) filter.order = { $regex: new RegExp(`^${order}$`, 'i') };

  const skip = (page - 1) * size;

  const [birds, total] = await Promise.all([
    birdModel.get(
      filter,
      { serialNumber: 1 },
      { serialNumber: 1, name: 1, scientificName: 1 },
      { skip, limit: size },
    ),
    birdModel.count(filter),
  ]);

  const serialNumbers = birds.map((b) => b.serialNumber);
  const birdMetas = await metaModel.get(
    { serialNumber: { $in: serialNumbers } },
    null,
    { serialNumber: 1, images: 1 },
  );

  const birdMetaMap = {};
  birdMetas.forEach((m) => { birdMetaMap[m.serialNumber] = { images: m.images }; });

  const data = birds.map((b) => ({
    id: b.serialNumber,
    name: b.name,
    scientificName: b.scientificName,
    image: birdMetaMap[b.serialNumber]?.images[0]
      ? { url: birdMetaMap[b.serialNumber].images[0].url, file: birdMetaMap[b.serialNumber].images[0].file }
      : '',
  }));

  const totalPages = Math.ceil(total / size);

  return {
    data,
    pagination: {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
};

const getGroups = async () => {
  const cached = cache.get('groups');
  if (cached) return cached;

  const groups = await birdModel.distinct('commonGroup');
  const sorted = groups.filter(Boolean).sort();
  cache.set('groups', sorted);
  return sorted;
};

export { getBirdById, getAllBirds, getGroups };
