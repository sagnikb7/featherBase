// baseRepository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async get(query, sort = null, projection = null) {
    let dbQuery = this.model.find(query, projection);
    if (sort) {
      dbQuery = dbQuery.sort(sort);
    }
    const data = await dbQuery.lean();
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
