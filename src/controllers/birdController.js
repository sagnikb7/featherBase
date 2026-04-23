import { getBirdById, getAllBirds, getGroups, updateBird } from '#services/birdService.js';
import { CONSTANTS } from '#constants/common.js';

const ALLOWED_IMAGE_HOSTS = [CONSTANTS.cdn.HOST];

const getBirdsController = async (req, res, next) => {
  try {
    const { id } = req.validated?.params || req.params;
    const result = await getBirdById(id);
    res.json({
      success: !!result,
      data: result || {},
    });
  } catch (error) {
    next(error);
  }
};

const getAllBirdsController = async (req, res, next) => {
  try {
    const { page, size, search, family, group, order } = req.validated?.query || req.query;

    const result = await getAllBirds({
      page: Number(page) || undefined,
      size: Number(size) || undefined,
      search,
      family,
      group,
      order,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getGroupsController = async (req, res, next) => {
  try {
    const groups = await getGroups();
    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

const imageProxyController = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url param required' });

    const parsed = new URL(url);
    if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
      return res.status(403).json({ error: 'host not allowed' });
    }

    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).end();

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const updateBirdController = async (req, res, next) => {
  try {
    const { id } = req.validated?.params || req.params;
    const result = await updateBird(Number(id), req.body);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Bird not found or no valid fields provided' });
    }
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export {
  getBirdsController, getAllBirdsController, getGroupsController,
  imageProxyController, updateBirdController,
};
