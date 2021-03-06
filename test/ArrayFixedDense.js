import test from 'ava';
import ArrayFixedDense from '../lib/ArrayFixedDense.js';

test('construction from length number', t => {
  let arr;
  arr = new ArrayFixedDense(100);
  t.is(arr.length, 100);
  t.is(arr.count, 0);
});

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

test('construction from static fromArray', t => {
  let arr;
  const children = [1,2];
  children.length = 10;
  arr = ArrayFixedDense.fromArray(children, 2, true);
  t.is(arr.count, 2);
  t.is(arr.length, 10);
});

test('collapsing should not affect a dense array', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3, , ,], true);
  arr.collapseLeft();
  t.deepEqual(arr.toArray(), [1,2,3, , ,]);
  arr.collapseRight();
  t.deepEqual(arr.toArray(), [1,2,3, , ,]);
  arr = new ArrayFixedDense([ , ,4,5,6], false);
  arr.collapseLeft();
  t.deepEqual(arr.toArray(), [ , ,4,5,6]);
  arr.collapseRight();
  t.deepEqual(arr.toArray(), [ , ,4,5,6]);
});

test('can switch direction', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3, , ,], true);
  arr.switchDirection(false);
  t.deepEqual(arr.toArray(), [ , ,1,2,3]);
  arr.switchDirection(true);
  t.deepEqual(arr.toArray(), [1,2,3, , ,]);
  arr = new ArrayFixedDense([ , ,4,5,6], false);
  arr.switchDirection(true);
  t.deepEqual(arr.toArray(), [4,5,6, , ,]);
  arr.switchDirection(false);
  t.deepEqual(arr.toArray(), [ , ,4,5,6]);
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
  // slice will truncate floats
  slice = arr.slice(1.5, 2.5);
  t.deepEqual(slice.toArray(), [2]);
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
  // slice will truncate floats
  slice = arr.slice(4.5, 5.5);
  t.deepEqual(slice.toArray(), [3]);
});

test('splice', t => {
  let arr, spliced;
  // left dense
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  spliced = arr.splice(5, 1, 5);
  t.is(spliced.direction, true);
  t.is(arr.direction, true);
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ ,]);
  t.is(arr.count, 5);
  t.deepEqual(arr.toArray(), [1,2,3,4,5, ,]);
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  spliced = arr.splice(0, 100);
  t.is(spliced.count, 4);
  t.deepEqual(spliced.toArray(), [1,2,3,4, , ,]);
  t.is(arr.count, 0);
  t.deepEqual(arr.toArray(), [ , , , , , ,]);
  arr = new ArrayFixedDense([1,2, , ,]);
  spliced = arr.splice(0, 2, 'A','B','C', 'D');
  t.is(spliced.count, 2);
  t.deepEqual(spliced.toArray(), [1,2]);
  t.is(arr.count, 4);
  t.deepEqual(arr.toArray(), ['A','B','C','D']);
  arr = new ArrayFixedDense([1,2, , ,]);
  spliced = arr.splice(2, 1, 'A', 'B');
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ ,]);
  t.is(arr.count, 4);
  t.deepEqual(arr.toArray(), [1,2,'A','B']);
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  spliced = arr.splice(-1, 100);
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ ,]);
  t.is(arr.count, 4);
  t.deepEqual(arr.toArray(), [1,2,3,4, , ,]);
  // right dense
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(0, 100);
  t.is(spliced.direction, false);
  t.is(arr.direction, false);
  t.is(spliced.count, 4);
  t.deepEqual(spliced.toArray(), [ , ,1,2,3,4]);
  t.is(arr.count, 0);
  t.deepEqual(arr.toArray(), [ , , , , , ,]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(0, 1, 0);
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ ,]);
  t.is(arr.count, 5);
  t.deepEqual(arr.toArray(), [ ,0,1,2,3,4]);
  arr = new ArrayFixedDense([ , , ,1,2,3,4], false);
  spliced = arr.splice(1, 2, 'A', 'B');
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ , ,]);
  t.is(arr.count, 6);
  t.deepEqual(arr.toArray(), [ ,'A','B',1,2,3,4]);
  arr = new ArrayFixedDense([ , , ,1,2,3,4], false);
  spliced = arr.splice(1, 3, 'A', 'B');
  t.is(spliced.count, 1);
  t.deepEqual(spliced.toArray(), [ , ,1]);
  t.is(arr.count, 5);
  t.deepEqual(arr.toArray(), [ , ,'A','B',2,3,4]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(0, 0, 'A', 'B');
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), []);
  t.is(arr.count, 6);
  t.deepEqual(arr.toArray(), ['A','B',1,2,3,4]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(1, 1, 'A', 'B');
  t.is(spliced.count, 0);
  t.deepEqual(spliced.toArray(), [ ,]);
  t.is(arr.count, 6);
  t.deepEqual(arr.toArray(), ['A','B',1,2,3,4]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(-1, 100);
  t.is(spliced.count, 1);
  t.deepEqual(spliced.toArray(), [4]);
  t.is(arr.count, 3);
  t.deepEqual(arr.toArray(), [ , , ,1,2,3]);
  arr = new ArrayFixedDense([ , ,1,2,3,4], false);
  spliced = arr.splice(-5, 100);
  t.is(spliced.count, 4);
  t.deepEqual(spliced.toArray(), [ ,1,2,3,4]);
  t.is(arr.count, 0);
  t.deepEqual(arr.toArray(), [ , , , , , ,]);
  // splice will truncate floats
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  spliced = arr.splice(1.5, 2.5, 2, 3);
  t.deepEqual([...spliced], [2,3]);
  t.deepEqual([...arr], [1,2,3,4, , ,]);
  // splice defaults to 0 for starting index
  arr = new ArrayFixedDense([1,2,3,4, , ,]);
  spliced = arr.splice(null, arr.length, 1, 2, 3, 4, 5, 6);
  t.deepEqual([...spliced], [1,2,3,4, , ,]);
  t.deepEqual([...arr], [1,2,3,4,5,6]);
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

test('findIndex', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,,4,5,,]);
  t.is(arr.findIndex((e) => e === undefined), 4);
  t.is(arr.findIndex((e) => e === 1), 0);
  t.is(arr.findIndex((e) => e === 5), 3);
  arr = new ArrayFixedDense([1,2, ,4,5, ,], false);
  t.is(arr.findIndex((e) => e === undefined), 0);
  t.is(arr.findIndex((e) => e === 1), 2);
  t.is(arr.findIndex((e) => e === 5), 5);
});

test('caret', t => {
  let arr;
  let origLength;
  let origCount;
  // caret left works as long as there's an empty slot
  arr = new ArrayFixedDense([1,2,3,4, , ,], true);
  origLength = arr.length;
  origCount = arr.count;
  arr.caretLeft(4, 5);
  t.is(arr.count, origCount + 1);
  arr.caretRight(5, 6);
  t.is(arr.count, origCount + 2);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,4,5,6]);
  // caret right works as long as there's an empty slot
  arr = new ArrayFixedDense([ , ,3,4,5,6], false);
  origCount = arr.count;
  origLength = arr.length;
  arr.caretRight(1, 2);
  arr.caretLeft(0, 1);
  t.is(arr.count, origCount + 2);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,4,5,6]);
  // caret left fails on when left is dense and index is in dense left
  arr = new ArrayFixedDense([1,2,3,4, , ,], true);
  origCount = arr.count;
  origLength = arr.length;
  t.throws(() => {
    arr.caretLeft(0, 0);
  }, RangeError);
  t.is(arr.count, origCount);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,4, , ,]);
  // caret right succeeds on dense left
  arr.caretRight(0, 0);
  t.is(arr.count, origCount + 1);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [0,1,2,3,4, ,]);
  // caret right fails on when right is dense and index is in dense right
  arr = new ArrayFixedDense([ , ,3,4,5,6], false);
  origCount = arr.count;
  origLength = arr.length;
  t.throws(() => {
    arr.caretRight(5, 7);
  }, RangeError);
  t.is(arr.count, origCount);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [ , ,3,4,5,6]);
  // caret left succeeds on dense right
  arr.caretLeft(5, 7);
  t.is(arr.count, origCount + 1);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [ ,3,4,5,6,7]);
  // we can try caret without worrying about direction
  arr = new ArrayFixedDense([3,4,5, , ,], true);
  origCount = arr.count;
  origLength = arr.length;
  arr.caret(0, 2);
  arr.caret(0, 1);
  t.is(arr.count, origCount + 2);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,4,5]);
  arr = new ArrayFixedDense([ , ,1,2,3], false);
  origCount = arr.count;
  origLength = arr.length;
  arr.caret(4, 4);
  arr.caret(4, 5);
  t.is(arr.count, origCount + 2);
  t.is(arr.length, origLength);
  t.deepEqual(arr.toArray(), [1,2,3,4,5]);
});

test('caret returns back inserted index', t => {
  let arr;
  arr = new ArrayFixedDense([1,2,3, , ,], true);
  t.is(arr.caret(4, 4), 3);
  t.is(arr.caret(4, 4), 4);
  arr = new ArrayFixedDense([ , , 4, 5, 6], false);
  t.is(arr.caretRight(0, 3), 1);
  t.is(arr.caretLeft(1, 3), 1);
});
