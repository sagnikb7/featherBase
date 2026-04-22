import NodeCache from 'node-cache';
import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';

const cache = new NodeCache({ stdTTL: 3600 });

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  const [metaData] = await metaModel.get({ serialNumber: id });
  return { ...data, meta: { images: metaData?.images || [] } };
};

const getAllBirds = async ({ page = 1, size = 10, search, family, group, order } = {}) => {
  const filter = {};
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { scientificName: { $regex: escaped, $options: 'i' } },
    ];
  }
  if (family) filter.family = { $regex: new RegExp(`^${escapeRegex(family)}$`, 'i') };
  if (group) filter.commonGroup = { $regex: new RegExp(`^${escapeRegex(group)}$`, 'i') };
  if (order) filter.order = { $regex: new RegExp(`^${escapeRegex(order)}$`, 'i') };

  const skip = (page - 1) * size;

  const [birds, total] = await Promise.all([
    birdModel.get(
      filter,
      { serialNumber: 1 },
      { serialNumber: 1, name: 1, scientificName: 1, commonGroup: 1 },
      { skip, limit: size },
    ),
    birdModel.count(filter),
  ]);

  const data = birds.map((b) => ({
    id: b.serialNumber,
    serialNumber: b.serialNumber,
    name: b.name,
    scientificName: b.scientificName,
    commonGroup: b.commonGroup,
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
