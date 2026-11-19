import assert from 'node:assert/strict';
import test from 'node:test';

import { getPathBasename } from './utils';

test('the repo name is the last folder of a POSIX or Windows path', () => {
  assert.equal(getPathBasename('/Volumes/GustavoData/programming/mercadolivre-laravel'), 'mercadolivre-laravel');
  assert.equal(getPathBasename('/Users/gustavodiniz/rfc-code/'), 'rfc-code');
  assert.equal(getPathBasename('C:\\Users\\dev\\rfc-code'), 'rfc-code');
});

test('a path with no separator is returned as is', () => {
  assert.equal(getPathBasename('rfc-code'), 'rfc-code');
  assert.equal(getPathBasename('/'), '/');
});
