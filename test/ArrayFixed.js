import test from 'ava';
import ArrayFixed from '../lib/ArrayFixed.js';

test('static construction from array', t => {
  const arr = ArrayFixed.fromArray([,1,,1,,1,,]);
  t.is(arr.size, 7);
  t.is(arr.count, 3);
  t.is(arr.indexFirst, 1);
  t.is(arr.indexLast, 5);
});
