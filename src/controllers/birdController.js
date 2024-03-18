import { getBirdById } from '#services/birdService.js';

const getBirds = async (req, res, next) => {
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

// eslint-disable-next-line import/prefer-default-export
export { getBirds };
