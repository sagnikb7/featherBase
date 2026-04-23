import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllBirdsValidator } from '#validators/birdValidator.js';

function validate(input) {
  return getAllBirdsValidator.validate(input, { abortEarly: false });
}

describe('getAllBirdsValidator – search field', () => {
  it('accepts a 1-char numeric query', () => {
    const { error } = validate({ search: '1' });
    assert.equal(error, undefined);
  });

  it('accepts a multi-digit numeric query', () => {
    const { error } = validate({ search: '42' });
    assert.equal(error, undefined);
  });

  it('rejects a 1-char text query', () => {
    const { error } = validate({ search: 'a' });
    assert.ok(error, 'expected a validation error');
  });

  it('rejects a 2-char text query', () => {
    const { error } = validate({ search: 'ki' });
    assert.ok(error, 'expected a validation error');
  });

  it('accepts a 3-char text query', () => {
    const { error } = validate({ search: 'kin' });
    assert.equal(error, undefined);
  });

  it('accepts a full order name like Galliformes', () => {
    const { error } = validate({ search: 'Galliformes' });
    assert.equal(error, undefined);
  });

  it('rejects a search string longer than 100 chars', () => {
    const { error } = validate({ search: 'a'.repeat(101) });
    assert.ok(error);
  });

  it('strips leading/trailing whitespace', () => {
    const { value } = validate({ search: '  eagle  ' });
    assert.equal(value.search, 'eagle');
  });
});

describe('getAllBirdsValidator – pagination', () => {
  it('defaults page to 1 and size to 10', () => {
    const { value } = validate({});
    assert.equal(value.page, 1);
    assert.equal(value.size, 10);
  });

  it('rejects page < 1', () => {
    const { error } = validate({ page: 0 });
    assert.ok(error);
  });

  it('rejects size > 100', () => {
    const { error } = validate({ size: 101 });
    assert.ok(error);
  });
});
