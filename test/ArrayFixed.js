import test from 'ava';
import ArrayFixed from '../lib/ArrayFixed.js';

test('construction from length number', t => {
  let arr;
  arr = new ArrayFixed(100);
  t.is(arr.length, 100);
  t.is(arr.count, 0);
});

test('construction from array', t => {
  const arr = new ArrayFixed([ ,1, ,1, ,1, ,]);
  t.is(arr.length, 7);
  t.is(arr.count, 3);
});

test('construction from static fromArray', t => {
  let arr;
  const children = [1,2];
  children.length = 10;
  arr = ArrayFixed.fromArray(children, 2);
  t.is(arr.count, 2);
  t.is(arr.length, 10);
});

test('setting elements', t => {
  const arr = new ArrayFixed(10);
  arr.set(0, 1);
  arr.set(9, 1);
  t.is(arr.count, 2);
});

test('truncation', t => {
  let arr;
  arr = new ArrayFixed([1,2,3, , , ,]);
  arr.truncateLeft(3);
  t.is(arr.length, 3);
  t.is(arr.count, 0);
  arr = new ArrayFixed([1,2,3, , , ,]);
  arr.truncateRight(3);
  t.is(arr.length, 3);
  t.is(arr.count, 3);
});

test('truncation using length', t => {
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

test('slice', t => {
  let arr, slice;
  arr = new ArrayFixed([1,2,3,4, , ,]);
  slice = arr.slice(0, arr.count / 2);
  t.deepEqual(slice.toArray(), [1,2]);
  slice = arr.slice(arr.count / 2);
  t.deepEqual(slice.toArray(), [3,4, , ,]);
  slice = arr.slice(0);
  t.deepEqual(slice.toArray(), [1,2,3,4, , ,]);
  slice = arr.slice(-2);
  t.deepEqual(slice.toArray(), [ , ,]);
  slice = arr.slice(-3, 4);
  t.deepEqual(slice.toArray(), [4]);
  slice = arr.slice(-3, -2);
  t.deepEqual(slice.toArray(), [4]);
  slice = arr.slice(2, 1);
  t.deepEqual(slice.toArray(), []);
  slice = arr.slice(arr.length);
  t.deepEqual(slice.toArray(), []);
  // slice will truncate floats
  slice = arr.slice(1.5, 2.5);
  t.deepEqual(slice.toArray(), [2]);
});

test('splice', t => {
  let arr;
  arr = new ArrayFixed([1,2, ,4,5, ,]);
  t.is(arr.count, 4);
  t.throws(() => {
    arr.splice(2, 0, 3);
  }, RangeError);
  arr.splice(2, 1, 3);
  t.deepEqual([...arr], [1, 2, 3, 4, 5, undefined]);
  t.is(arr.count, 5);
  let spliced;
  // splice will truncate floats
  arr = new ArrayFixed([1,2, ,4,5, ,]);
  spliced = arr.splice(1.5, 2.5, 2, 3);
  t.deepEqual([...spliced], [2, ,]);
  t.deepEqual([...arr], [1,2,3,4,5, ,]);
  // splice defaults to 0 for starting index
  arr = new ArrayFixed([1,2, ,4,5, ,]);
  spliced = arr.splice(null, arr.length, 1, 2, 3, 4, 5, 6);
  t.deepEqual([...spliced], [1,2, , 4,5, ,]);
  t.deepEqual([...arr], [1,2,3,4,5,6]);
});

test('map', t => {
  const arr = new ArrayFixed([1,2, ,4,5, ,]);
  const arrM = arr.map((number, index) => {
    return number.toString();
  });
  t.deepEqual(arrM.toArray(), ['1', '2', , '4', '5', ,]);
  t.is(arrM.count, 4);
});

test('findIndex', t => {
  const arr = new ArrayFixed([1,2, ,4,5, ,]);
  t.is(arr.findIndex((e) => e === undefined), 2);
  t.is(arr.findIndex((e) => e === 1), 0);
  t.is(arr.findIndex((e) => e === 5), 4);
});

test('caret', t => {
  let arr;
  let origLength;
  // left caret
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caretLeft(3, 10);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,10,4, ,5]);
  // right caret
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caretRight(3, 10);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1, ,2,10,3,4,5]);
  // caret preferred left
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caret(3, 10, true);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,10,4, ,5]);
  // caret preferred right
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caret(3, 10, false);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1, ,2,10,3,4,5]);
  // caret preferred left, with right caret succeeding
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caret(4, 10, true);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1, ,2,3,10,4,5]);
  // caret preferred right, with left caret succeeding
  arr = new ArrayFixed([1, ,2,3,4, ,5]);
  origLength = arr.length;
  arr.caret(2, 10, false);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,10,3,4, ,5]);
  // caret into empty array should succeed
  arr = new ArrayFixed([ , , ,]);
  origLength = arr.length;
  arr.caret(1, 10);
  arr.caret(0, 10);
  arr.caret(2, 10);
  t.is(arr.length, origLength);
  // caret into a full array should fail
  t.throws(() => {
    arr.caret(1, 10);
  }, RangeError);
  t.throws(() => {
    arr.caretLeft(1, 10);
  }, RangeError);
  t.throws(() => {
    arr.caretRight(1, 10);
  }, RangeError);
  // caret left fails when left is dense
  arr = new ArrayFixed([1,2, ,]);
  t.throws(() => {
    arr.caretLeft(1, 10);
  }, RangeError);
  // caret right fails when right is dense
  arr = new ArrayFixed([ ,2,3]);
  t.throws(() => {
    arr.caretRight(1, 10);
  }, RangeError);
  // out of bounds index should fail
  arr = new ArrayFixed([ ,2, ,]);
  t.throws(() => {
    arr.caretRight(10, 10);
  }, RangeError);
  t.deepEqual(arr.toArray(), [ ,2, ,]);
  t.throws(() => {
    arr.caretLeft(-10, 10);
  }, RangeError);
  t.deepEqual(arr.toArray(), [ ,2, ,]);
  t.throws(() => {
    arr.caret(100, 10);
  }, RangeError);
  t.deepEqual(arr.toArray(), [ ,2, ,]);
});
