import NodeCache from 'node-cache';
import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';
import { CONSTANTS } from '#constants/common.js';

const cache = new NodeCache({ stdTTL: 3600 });

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  if (!data) {
    return null;
  }

  const [metaData] = await metaModel.get({ serialNumber: id });
  const { IMAGES_BASE } = CONSTANTS.cdn;
  const images = (metaData?.images || []).map(({ file, tags }) => ({
    file: file || null,
    cdn: file ? `${IMAGES_BASE}/${file}` : null,
    tags,
  }));
  return { ...data, meta: { images } };
};

const getAllBirds = async ({ page = 1, size = 10, search, family, group, order } = {}) => {
  const filter = {};
  if (search) {
    const escaped = escapeRegex(search);
    const serialNum = /^\d+$/.test(search) ? Number(search) : null;
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { scientificName: { $regex: escaped, $options: 'i' } },
      ...(serialNum !== null ? [{ serialNumber: serialNum }] : []),
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

  const groups = await birdModel.aggregate([
    { $match: { commonGroup: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: '$commonGroup', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, title: '$_id', count: 1 } },
  ]);

  const result = groups.filter((g) => g.title);
  cache.set('groups', result);
  return result;
};

// Allowed top-level fields that callers may patch on a bird document
const PATCHABLE_FIELDS = new Set([
  'name', 'scientificName', 'iucnStatus', 'habitat', 'distributionRangeSize',
  'bestSeenAt', 'migrationStatus', 'order', 'family', 'commonGroup', 'rarity',
  'identification', 'colors', 'size', 'sizeRange', 'diet', 'speciesCode', 'verification',
]);

const updateBird = async (serialNumber, patch) => {
  const $set = {};

  for (const [key, value] of Object.entries(patch)) {
    if (!PATCHABLE_FIELDS.has(key)) continue;

    // verification is merged at sub-key level to avoid wiping sibling keys
    if (key === 'verification' && typeof value === 'object' && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        $set[`verification.${subKey}`] = subValue;
      }
    } else {
      $set[key] = value;
    }
  }

  if (Object.keys($set).length === 0) return null;

  return birdModel.update({ serialNumber }, { $set });
};

export { getBirdById, getAllBirds, getGroups, updateBird };
