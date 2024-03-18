// baseRepository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async get(query) {
    const data = await this.model.find(query).lean();
    return data;
  }

  async getOne(query) {
    const data = await this.model.findOne(query).lean();
    return data;
  }

  async create(newObj) {
    // eslint-disable-next-line new-cap
    const obj = new this.model({ ...newObj });
    const result = await obj.save();
    return result;
  }
}

export default BaseRepository;
