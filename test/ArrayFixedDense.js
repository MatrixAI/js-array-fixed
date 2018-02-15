import test from 'ava';
import ArrayFixedDense from '../lib/ArrayFixedDense.js';

test('construction from array', t => {
  let arr;
  arr = new ArrayFixedDense([ ,1, ,1, ,1, ,]);
  t.is(arr.length, 7);
  t.is(arr.count, 3);
  t.deepEqual(
    [...arr],
    [1, 1, 1, undefined, undefined, undefined, undefined]
  );
  arr = new ArrayFixedDense([ ,1, ,1, ,1, ,], false);
  t.is(arr.length, 7);
  t.is(arr.count, 3);
  t.deepEqual(
    [...arr],
    [undefined, undefined, undefined, undefined, 1, 1, 1]
  );
});

test('setting elements', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3, , ,]);
  arr.set(0, 0);
  t.is(arr.count, 3);
  arr.set(4, 4);
  t.is(arr.count, 4);
  t.deepEqual(arr.toArray(), [0,2,3,4, ,]);
  arr = new ArrayFixedDense([ , ,1,2,3], false);
  arr.set(4, 4);
  t.is(arr.count, 3);
  arr.set(0, 0);
  t.is(arr.count, 4);
  t.deepEqual(arr.toArray(), [ ,0,1,2,4]);
});

test('unsetting elements', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3, , ,]);
  arr.unset(1);
  t.is(arr.count, 2);
  t.is(arr.length, 5);
  t.deepEqual(arr.toArray(), [1,3, , , ,]);
  arr = new ArrayFixedDense([1,2,3]);
  arr.unset(0);
  t.is(arr.count, 2);
  t.is(arr.length, 3);
  t.deepEqual(arr.toArray(), [2,3, ,]);
  arr = new ArrayFixedDense([1,2,3]);
  arr.unset(2);
  t.is(arr.count, 2);
  t.is(arr.length, 3);
  t.deepEqual(arr.toArray(), [1,2, ,]);
  arr = new ArrayFixedDense([1]);
  arr.unset(0);
  t.is(arr.count, 0);
  t.is(arr.length, 1);
  t.deepEqual(arr.toArray(), [ ,]);
  arr = new ArrayFixedDense([ , ,1,2,3], false);
  arr.unset(3);
  t.is(arr.count, 2);
  t.is(arr.length, 5);
  t.deepEqual(arr.toArray(), [ , , ,1,3]);
  arr = new ArrayFixedDense([1,2,3], false);
  arr.unset(0);
  t.is(arr.count, 2);
  t.is(arr.length, 3);
  t.deepEqual(arr.toArray(), [ ,2,3]);
  arr = new ArrayFixedDense([1,2,3], false);
  arr.unset(2);
  t.is(arr.count, 2);
  t.is(arr.length, 3);
  t.deepEqual(arr.toArray(), [ ,1,2]);
  arr = new ArrayFixedDense([1], false);
  arr.unset(0);
  t.is(arr.count, 0);
  t.is(arr.length, 1);
  t.deepEqual(arr.toArray(), [ ,]);
});

test('slice', t => {
  let arr, slice;
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
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
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  slice = arr.slice(0, arr.count / 2);
  t.deepEqual(slice.toArray(), [ , ,]);
  slice = arr.slice(arr.count / 2);
  t.deepEqual(slice.toArray(), [1,2,3,4]);
  slice = arr.slice(0);
  t.deepEqual(slice.toArray(), [ , ,1,2,3,4]);
  slice = arr.slice(-2);
  t.deepEqual(slice.toArray(), [3,4]);
  slice = arr.slice(-3, 4);
  t.deepEqual(slice.toArray(), [2]);
  slice = arr.slice(-3, -2);
  t.deepEqual(slice.toArray(), [2]);
  slice = arr.slice(2, 1);
  t.deepEqual(slice.toArray(), []);
  slice = arr.slice(arr.length);
  t.deepEqual(slice.toArray(), []);
});

test('splice', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  arr.splice(5, 1, 5);
  t.is(arr.count, 5);
  t.deepEqual(arr.toArray(), [1,2,3,4,5, ,]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  arr.splice(0, 1, 0);
  t.is(arr.count, 5);
  t.deepEqual(arr.toArray(), [ ,0,1,2,3,4]);
});

test('reverse', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  arr.reverse();
  t.deepEqual(arr.toArray(), [4,3,2,1, , ,]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  arr.reverse();
  t.deepEqual(arr.toArray(), [ , ,4,3,2,1]);
});

test('map', t => {
  const arr = new ArrayFixedDense([1,2,,4,5,,]);
  const arrM = arr.map((number, index) => {
    return number.toString();
  });
  t.deepEqual(arrM.toArray(), ['1','2','4','5', , ,]);
  t.is(arrM.count, 4);
});
