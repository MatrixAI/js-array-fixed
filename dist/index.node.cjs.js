'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _getIterator = _interopDefault(require('babel-runtime/core-js/get-iterator'));
var _Symbol$iterator = _interopDefault(require('babel-runtime/core-js/symbol/iterator'));
var _Object$keys = _interopDefault(require('babel-runtime/core-js/object/keys'));

/** @module ArrayFixed */

/**
 * Class representing a fixed size array.
 * Functions will respect the set size.
 * This also maintains a count of the non-empty items.
 */
class ArrayFixed {

  constructor(sizeOrArray = 0) {
    this._count = 0;

    if (typeof sizeOrArray === 'number') {
      this._array = new Array(sizeOrArray);
    } else {
      let count = 0;
      _Object$keys(sizeOrArray).map(() => {
        ++count;
      });
      this._count = count;
      this._array = sizeOrArray.slice(); // slice preserves sparsity
    }
  }

  get length() {
    return this._array.length;
  }

  set length(length) {
    if (length < this._array.length) {
      const truncated = this._array.splice(length);
      let count = 0;
      _Object$keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array.length = length;
    }
  }

  get count() {
    return this._count;
  }

  // $FlowFixMe: computed property
  [_Symbol$iterator]() {
    return _getIterator(this._array);
  }

  toArray() {
    return this._array.slice(); // slice preserves sparsity
  }

  get(index) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    return this._array[index];
  }

  set(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    if (!this._array.hasOwnProperty(index)) {
      this._array[index] = value;
      ++this._count;
    } else {
      this._array[index] = value;
    }
    return;
  }

  unset(index) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    if (this._array.hasOwnProperty(index)) {
      delete this._array[index];
      --this._count;
      return true;
    } else {
      return false;
    }
  }

  slice(begin, end) {
    return this._array.slice(begin, end);
  }

  splice(indexStart, deleteCount, ...items) {
    // bound indexStart according to splice behaviour
    if (indexStart > this._array.length) {
      indexStart = this._array.length;
    } else if (indexStart < 0) {
      indexStart = Math.max(indexStart + this._array.length, 0);
    }
    // deleteCount is set to the rest of the array if only indexStart is set
    if (arguments.length === 1) {
      deleteCount = this._array.length - indexStart;
    } else {
      deleteCount = deleteCount | 0;
    }
    if (deleteCount !== items.length) {
      throw RangeError('Splicing will result in underflow or overflow');
    }
    // count how many set items are deleted
    let deletedCount = 0;
    for (let i = 0; i < deleteCount; ++i) {
      if (this._array.hasOwnProperty(indexStart + i)) ++deletedCount;
    }
    const deletedItems = this._array.splice(indexStart, deleteCount, ...items);
    this._count += items.length - deletedCount;
    return deletedItems;
  }

  map(callback) {
    return new ArrayFixed(this._array.map(callback));
  }

  collapseLeft() {
    const arrayNew = _Object$keys(this._array).map(k => this._array[k]);
    arrayNew.length = this._array.length;
    this._array = arrayNew;
  }

  collapseRight() {
    const arrayNew = _Object$keys(this._array).map(k => this._array[k]);
    this._array = new Array(this._array.length - arrayNew.length).concat(arrayNew);
  }

}

module.exports = ArrayFixed;
