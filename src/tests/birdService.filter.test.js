/**
 * Pure unit tests for buildSearchFilterFromLists.
 * No mocking needed — the function has zero side effects.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchFilterFromLists } from '#services/birdService.js';

const LISTS = {
  orders: ['Galliformes', 'Falconiformes', 'Andorina', 'Passeriformes'],
  families: ['Phasianidae', 'Falconidae', 'Geezos', 'Anatidae'],
  groups: ['Kingfishers', 'Eagles', 'Geese', 'Owls'],
};

function orKeys(filter) {
  return (filter.$or ?? []).map((c) => Object.keys(c)[0]);
}

function getOrClause(filter, field) {
  return filter.$or?.find((c) => c[field]);
}

function toRegex(clause) {
  return new RegExp(clause.$regex, clause.$options);
}

// ─── Numeric queries ──────────────────────────────────────────────────────────

describe('numeric search — serial number only', () => {
  it('returns exact serialNumber match for single digit', () => {
    const f = buildSearchFilterFromLists('5', LISTS);
    assert.deepEqual(f, { serialNumber: 5 });
  });

  it('returns exact serialNumber match for multi-digit', () => {
    const f = buildSearchFilterFromLists('42', LISTS);
    assert.deepEqual(f, { serialNumber: 42 });
  });

  it('produces no $or for numeric query', () => {
    const f = buildSearchFilterFromLists('1', LISTS);
    assert.equal(f.$or, undefined);
  });

  it('does not match any text field for numeric query', () => {
    const f = buildSearchFilterFromLists('99', LISTS);
    assert.equal(Object.keys(f).length, 1);
    assert.equal(Object.keys(f)[0], 'serialNumber');
  });
});

// ─── Name search — word-boundary prefix ──────────────────────────────────────

describe('name search — word-boundary regex', () => {
  it('includes a name clause with word-boundary regex', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const clause = getOrClause(f, 'name');
    assert.ok(clause, 'missing name clause');
    assert.match(clause.name.$regex, /^\\b/);
    assert.equal(clause.name.$options, 'i');
  });

  it('matches a name where the query starts a word (Barn Owl)', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.match('Barn Owl', re);
  });

  it('matches when query is at the start of the whole name (Owlet Kuku)', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.match('Owlet Kuku', re);
  });

  it('matches hyphenated name where query starts after hyphen (ako-owl)', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.match('ako-owl', re);
  });

  it('matches mid-name word (baka owl)', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.match('baka owl', re);
  });

  it('does NOT match when query is mid-word (Surfowl)', () => {
    const f = buildSearchFilterFromLists('owl', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.doesNotMatch('Surfowl', re);
  });

  it('is case-insensitive', () => {
    const f = buildSearchFilterFromLists('OWL', LISTS);
    const re = toRegex(getOrClause(f, 'name').name);
    assert.match('Barn owl', re);
    assert.match('BARN OWL', re);
  });
});

// ─── Scientific name — word-boundary on genus AND species ────────────────────

describe('scientificName search — word-boundary regex', () => {
  it('matches start of genus (Axis baku)', () => {
    const f = buildSearchFilterFromLists('axi', LISTS);
    const re = toRegex(getOrClause(f, 'scientificName').scientificName);
    assert.match('Axis baku', re);
  });

  it('matches start of species even when genus is first (Baku axis)', () => {
    const f = buildSearchFilterFromLists('axi', LISTS);
    const re = toRegex(getOrClause(f, 'scientificName').scientificName);
    assert.match('Baku axis', re);
  });

  it('does NOT match mid-word in genus (Peraxis baku)', () => {
    const f = buildSearchFilterFromLists('axi', LISTS);
    const re = toRegex(getOrClause(f, 'scientificName').scientificName);
    assert.doesNotMatch('Peraxis baku', re);
  });

  it('does NOT match mid-word in species (Baku peraxis)', () => {
    const f = buildSearchFilterFromLists('axi', LISTS);
    const re = toRegex(getOrClause(f, 'scientificName').scientificName);
    assert.doesNotMatch('Baku peraxis', re);
  });
});

// ─── Taxonomic prefix matching ────────────────────────────────────────────────

describe('order prefix matching', () => {
  it('Gall matches Galliformes', () => {
    const f = buildSearchFilterFromLists('Gall', LISTS);
    const clause = getOrClause(f, 'order');
    assert.ok(clause);
    assert.ok(clause.order.$in.includes('Galliformes'));
  });

  it('Ando matches Andorina', () => {
    const f = buildSearchFilterFromLists('Ando', LISTS);
    assert.ok(getOrClause(f, 'order').order.$in.includes('Andorina'));
  });

  it('rina does NOT match Andorina (not a prefix)', () => {
    const f = buildSearchFilterFromLists('rina', LISTS);
    assert.equal(getOrClause(f, 'order'), undefined);
  });

  it('prefix match is case-insensitive (gall → Galliformes)', () => {
    const f = buildSearchFilterFromLists('gall', LISTS);
    assert.ok(getOrClause(f, 'order').order.$in.includes('Galliformes'));
  });

  it('prefix matches multiple orders when applicable', () => {
    const f = buildSearchFilterFromLists('Fal', LISTS);
    assert.ok(getOrClause(f, 'order').order.$in.includes('Falconiformes'));
  });

  it('adds no order clause when nothing matches', () => {
    const f = buildSearchFilterFromLists('xyz', LISTS);
    assert.equal(getOrClause(f, 'order'), undefined);
  });
});

describe('family prefix matching', () => {
  it('Pha matches Phasianidae', () => {
    const f = buildSearchFilterFromLists('Pha', LISTS);
    assert.ok(getOrClause(f, 'family').family.$in.includes('Phasianidae'));
  });

  it('mid-string does not match (asianidae)', () => {
    const f = buildSearchFilterFromLists('asianidae', LISTS);
    assert.equal(getOrClause(f, 'family'), undefined);
  });
});

describe('commonGroup prefix matching', () => {
  it('Kin matches Kingfishers', () => {
    const f = buildSearchFilterFromLists('Kin', LISTS);
    assert.ok(getOrClause(f, 'commonGroup').commonGroup.$in.includes('Kingfishers'));
  });

  it('Gee matches Geese', () => {
    const f = buildSearchFilterFromLists('Gee', LISTS);
    assert.ok(getOrClause(f, 'commonGroup').commonGroup.$in.includes('Geese'));
  });
});

// ─── The "Gee" edge case ──────────────────────────────────────────────────────

describe('"Gee" edge case — hits group, family, and text fields simultaneously', () => {
  it('produces name, scientificName, commonGroup, AND family clauses', () => {
    const f = buildSearchFilterFromLists('Gee', LISTS);
    const keys = orKeys(f);
    assert.ok(keys.includes('name'), 'missing name');
    assert.ok(keys.includes('scientificName'), 'missing scientificName');
    assert.ok(keys.includes('commonGroup'), 'missing commonGroup');
    assert.ok(keys.includes('family'), 'missing family');
  });

  it('commonGroup $in contains Geese', () => {
    const f = buildSearchFilterFromLists('Gee', LISTS);
    assert.ok(getOrClause(f, 'commonGroup').commonGroup.$in.includes('Geese'));
  });

  it('family $in contains Geezos', () => {
    const f = buildSearchFilterFromLists('Gee', LISTS);
    assert.ok(getOrClause(f, 'family').family.$in.includes('Geezos'));
  });
});

// ─── Empty / no-match text queries ───────────────────────────────────────────

describe('text query with no taxonomic hits', () => {
  it('still includes name and scientificName clauses', () => {
    const f = buildSearchFilterFromLists('hornbill', LISTS);
    const keys = orKeys(f);
    assert.ok(keys.includes('name'));
    assert.ok(keys.includes('scientificName'));
  });

  it('has no order/family/group clauses when nothing prefix-matches', () => {
    const f = buildSearchFilterFromLists('hornbill', LISTS);
    const keys = orKeys(f);
    assert.ok(!keys.includes('order'));
    assert.ok(!keys.includes('family'));
    assert.ok(!keys.includes('commonGroup'));
  });
});
