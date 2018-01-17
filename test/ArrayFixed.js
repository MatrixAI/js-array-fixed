import test from 'ava';
import ArrayFixed from '../lib/ArrayFixed.js';

test('static construction from array', t => {
  const arr = new ArrayFixed([,1,,1,,1,,]);
  t.is(arr.length, 7);
  t.is(arr.count, 3);
});

test('setting elements', t => {
  const arr = new ArrayFixed(10);
  arr.set(0, 1);
  arr.set(9, 1);
  t.is(arr.count, 2);
});

test('truncation', t => {
  const arr = new ArrayFixed(100);
  arr.set(0, 1);
  arr.set(99, 1);
  t.is(arr.count, 2);
  arr.length = 50;
  t.is(arr.count, 1);
  t.is(arr.get(0), 1);
  t.throws(() => {
    arr.get(99);
  }, RangeError);
  arr.length = 100;
  t.is(arr.get(99), undefined);
});

test('iterator', t => {
  const arr = [1,2,,3,4];
  const arrF = new ArrayFixed(arr);
  // this is equivalent to using Symbol.Iterator
  t.deepEqual([...arr], [...arrF]);
});

test('splice', t => {
  const arr = new ArrayFixed([1,2,,4,5,,]);
  t.is(arr.count, 4);
  t.throws(() => {
    arr.splice(2, 0, 3);
  }, RangeError);
  arr.splice(2, 1, 3);
  t.deepEqual([...arr], [1, 2, 3, 4, 5, undefined]);
  t.is(arr.count, 5);
});

test('map', t => {
  const arr = new ArrayFixed([1,2,,4,5,,]);
  const arrM = arr.map((number, index, array) => {
    return number.toString();
  });
  t.deepEqual([...arrM], ['1', '2', undefined, '4', '5', undefined]);
  t.is(arrM.count, 4);
});
