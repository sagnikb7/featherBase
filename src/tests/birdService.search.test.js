/**
 * Integration-style tests for getAllBirds — mocks birdModel so no real DB needed.
 * Tests that the filter reaching the model is correct for the full async path.
 */
import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let capturedFilter = null;

// Aggregate returns taxonomic lists used by buildSearchFilter internally
await mock.module('#models/birdBasicModel.js', {
  defaultExport: {
    get: async (filter) => { capturedFilter = filter; return []; },
    count: async () => 0,
    aggregate: async (pipeline) => {
      const groupId = pipeline.find((s) => s.$group)?.$group?._id;
      if (groupId === '$commonGroup') return [{ title: 'Kingfishers', count: 5 }, { title: 'Geese', count: 2 }];
      if (groupId === '$order') return [{ value: 'Galliformes' }, { value: 'Falconiformes' }];
      if (groupId === '$family') return [{ value: 'Phasianidae' }, { value: 'Geezos' }];
      return [];
    },
  },
});

await mock.module('#models/metaModel.js', {
  defaultExport: { get: async () => [] },
});

await mock.module('#constants/common.js', {
  namedExports: {
    CONSTANTS: { cdn: { IMAGES_BASE: 'https://example.com/images' } },
  },
});

const { getAllBirds } = await import('#services/birdService.js');

function orKeys(filter) {
  return (filter.$or ?? []).map((c) => Object.keys(c)[0]);
}

describe('getAllBirds — numeric search', () => {
  beforeEach(() => { capturedFilter = null; });

  it('passes exact serialNumber filter with no $or', async () => {
    await getAllBirds({ search: '5' });
    assert.deepEqual(capturedFilter, { serialNumber: 5 });
  });

  it('passes exact serialNumber for multi-digit', async () => {
    await getAllBirds({ search: '42' });
    assert.deepEqual(capturedFilter, { serialNumber: 42 });
  });
});

describe('getAllBirds — text search filter shape', () => {
  beforeEach(() => { capturedFilter = null; });

  it('includes name and scientificName word-boundary clauses', async () => {
    await getAllBirds({ search: 'eagle' });
    const keys = orKeys(capturedFilter);
    assert.ok(keys.includes('name'));
    assert.ok(keys.includes('scientificName'));
  });

  it('name clause uses word-boundary regex', async () => {
    await getAllBirds({ search: 'owl' });
    const nameClause = capturedFilter.$or.find((c) => c.name);
    assert.match(nameClause.name.$regex, /^\\b/);
  });

  it('resolves Gall prefix to Galliformes order clause', async () => {
    await getAllBirds({ search: 'Gall' });
    const orderClause = capturedFilter.$or.find((c) => c.order);
    assert.ok(orderClause, 'expected an order clause');
    assert.ok(orderClause.order.$in.includes('Galliformes'));
  });

  it('resolves Gee prefix to Geese group and Geezos family clauses', async () => {
    await getAllBirds({ search: 'Gee' });
    const groupClause = capturedFilter.$or.find((c) => c.commonGroup);
    const familyClause = capturedFilter.$or.find((c) => c.family);
    assert.ok(groupClause?.commonGroup.$in.includes('Geese'), 'missing Geese in commonGroup');
    assert.ok(familyClause?.family.$in.includes('Geezos'), 'missing Geezos in family');
  });

  it('no order/family/group $or clauses when nothing prefix-matches', async () => {
    await getAllBirds({ search: 'hornbill' });
    const keys = orKeys(capturedFilter);
    assert.ok(!keys.includes('order'));
    assert.ok(!keys.includes('family'));
    assert.ok(!keys.includes('commonGroup'));
  });
});

describe('getAllBirds — independent filter params', () => {
  beforeEach(() => { capturedFilter = null; });

  it('group filter applied independently (no search)', async () => {
    await getAllBirds({ group: 'Kingfishers' });
    assert.ok(capturedFilter.commonGroup, 'missing commonGroup filter');
    assert.equal(capturedFilter.$or, undefined);
  });

  it('order filter applied independently', async () => {
    await getAllBirds({ order: 'Galliformes' });
    assert.ok(capturedFilter.order);
    assert.equal(capturedFilter.$or, undefined);
  });

  it('family filter applied independently', async () => {
    await getAllBirds({ family: 'Phasianidae' });
    assert.ok(capturedFilter.family);
    assert.equal(capturedFilter.$or, undefined);
  });

  it('no filter built when neither search nor filters are provided', async () => {
    await getAllBirds({});
    assert.deepEqual(capturedFilter, {});
  });
});
