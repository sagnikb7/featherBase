import NodeCache from 'node-cache';
import birdModel from '#models/birdBasicModel.js';
import metaModel from '#models/metaModel.js';
import { CONSTANTS } from '#constants/common.js';

const cache = new NodeCache({ stdTTL: 3600 });

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const prefixMatch = (list, query) =>
  list.filter((v) => v.toLowerCase().startsWith(query.toLowerCase()));

const getBirdById = async (id) => {
  const [data] = await birdModel.get({ serialNumber: id });
  if (!data) return null;

  const [metaData] = await metaModel.get({ serialNumber: id });
  const { IMAGES_BASE } = CONSTANTS.cdn;
  const images = (metaData?.images || []).map(({ file, tags }) => ({
    file: file || null,
    cdn: file ? `${IMAGES_BASE}/${file}` : null,
    tags,
  }));
  return { ...data, meta: { images } };
};

/**
 * Pure filter builder — accepts pre-resolved taxonomic lists so it can be
 * tested without any database or cache dependency.
 *
 * @param {string} search
 * @param {{ orders: string[], families: string[], groups: string[] }} lists
 */
const buildSearchFilterFromLists = (search, { orders = [], families = [], groups = [] } = {}) => {
  if (/^\d+$/.test(search)) {
    return { serialNumber: Number(search) };
  }

  const wordBoundaryRegex = { $regex: `\\b${escapeRegex(search)}`, $options: 'i' };

  const matchedOrders = prefixMatch(orders, search);
  const matchedFamilies = prefixMatch(families, search);
  const matchedGroups = prefixMatch(groups, search);

  return {
    $or: [
      { name: wordBoundaryRegex },
      { scientificName: wordBoundaryRegex },
      ...(matchedOrders.length ? [{ order: { $in: matchedOrders } }] : []),
      ...(matchedFamilies.length ? [{ family: { $in: matchedFamilies } }] : []),
      ...(matchedGroups.length ? [{ commonGroup: { $in: matchedGroups } }] : []),
    ],
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

const getDistinctOrders = async () => {
  const cached = cache.get('orders');
  if (cached) return cached;

  const result = await birdModel.aggregate([
    { $match: { order: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: '$order' } },
    { $project: { _id: 0, value: '$_id' } },
  ]);

  const orders = result.map((r) => r.value).filter(Boolean);
  cache.set('orders', orders);
  return orders;
};

const getDistinctFamilies = async () => {
  const cached = cache.get('families');
  if (cached) return cached;

  const result = await birdModel.aggregate([
    { $match: { family: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: '$family' } },
    { $project: { _id: 0, value: '$_id' } },
  ]);

  const families = result.map((r) => r.value).filter(Boolean);
  cache.set('families', families);
  return families;
};

const buildSearchFilter = async (search) => {
  if (/^\d+$/.test(search)) return { serialNumber: Number(search) };

  const [orderList, familyList, groupList] = await Promise.all([
    getDistinctOrders(),
    getDistinctFamilies(),
    getGroups(),
  ]);

  return buildSearchFilterFromLists(search, {
    orders: orderList,
    families: familyList,
    groups: groupList.map((g) => g.title),
  });
};

const getAllBirds = async ({ page = 1, size = 10, search, family, group, order } = {}) => {
  const filter = search ? await buildSearchFilter(search) : {};

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

export {
  getBirdById, getAllBirds, getGroups, updateBird,
  buildSearchFilterFromLists,
};
