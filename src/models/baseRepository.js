// baseRepository.js
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async get(query, sort = null, projection = null, { skip, limit } = {}) {
    let dbQuery = this.model.find(query, projection);
    if (sort) {
      dbQuery = dbQuery.sort(sort);
    }
    if (skip != null) dbQuery = dbQuery.skip(skip);
    if (limit != null) dbQuery = dbQuery.limit(limit);
    const data = await dbQuery.lean();
    return data;
  }

  async count(query) {
    return this.model.countDocuments(query);
  }

  async distinct(field, query = {}) {
    return this.model.distinct(field, query);
  }

  async getOne(query) {
    const data = await this.model.findOne(query).lean();
    return data;
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  async create(newObj) {
    const obj = new this.model(newObj);
    const result = await obj.save();
    return result;
  }

  async update(query, updateObj, options = {}) {
    return this.model.findOneAndUpdate(query, updateObj, { new: true, ...options });
  }
}

export default BaseRepository;
