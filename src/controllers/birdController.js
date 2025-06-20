import { getBirdById, getAllBirds } from '#services/birdService.js';

const getBirdsController = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    const result = await getAllBirds();
    res.json({
      success: !!result,
      data: result || {},
    });
  } catch (error) {
    next(error);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { getBirdsController, getAllBirdsController };
