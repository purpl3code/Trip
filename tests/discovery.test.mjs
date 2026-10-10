import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearch, ratingValues, averageRating, groupLocations } from '../src/utils/discovery.ts';
import { errorMessage } from '../src/utils/errors.ts';

const post = (location, rating, comments = []) => ({ location, rating, comments });

test('search matches accents, case and surrounding whitespace', () => {
  assert.equal(normalizeSearch('  CÃO Veio  '), 'cao veio');
  assert.equal(normalizeSearch('Tô no Park'), normalizeSearch('to no park'));
});
test('invalid or missing ratings do not corrupt averages', () => {
  assert.deepEqual(ratingValues(post('Café', 4, [{ rating: undefined }, { rating: NaN }, { rating: 0 }, { rating: 6 }, { rating: 2 }])), [4, 2]);
  assert.equal(averageRating([]), 0);
  assert.equal(averageRating([5, 3]), 4);
});
test('locations merge accents and case while preserving every review', () => {
  const groups = groupLocations([post('Café', 5, [{ rating: 5 }, { rating: 5 }]), post(' cafe ', 1), post('Outro', 3)]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].name, 'Café');
  assert.equal(groups[0].posts.length, 2);
  assert.equal(groups[0].rating, 4); // Mean of all four reviews, not of two post averages.
});
test('blank locations do not appear as discoverable places', () => {
  assert.equal(groupLocations([post('  ', 5)]).length, 0);
});
test('errors explain network failures and login issues in Portuguese', () => {
  assert.match(errorMessage(new Error('Failed to fetch')), /internet/);
  assert.equal(errorMessage({ message: 'Invalid login credentials' }), 'E-mail ou senha incorretos.');
  assert.match(errorMessage({ message: 'new row violates row-level security policy' }), /permissão/);
});
