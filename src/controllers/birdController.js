import { getBirdById, getAllBirds, getGroups } from '#services/birdService.js';

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
    const {
      page, size, family, group, order,
    } = req.validated?.query || req.query;

    const result = await getAllBirds({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
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

export { getBirdsController, getAllBirdsController, getGroupsController };
