'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _slicedToArray = _interopDefault(require('babel-runtime/helpers/slicedToArray'));
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
      // $FlowFixMe: Arrays are objects
      _Object$keys(sizeOrArray).map(() => {
        ++count;
      });
      this._array = sizeOrArray.slice(); // slice preserves sparsity
      this._count = count;
    }
  }

  /**
   * Construct from reference.
   * This skips the integrity process in the normal constructor.
   * The array must have the correct count.
   */
  static fromArray(array, count) {
    const arrayFixed = new ArrayFixed(array.length);
    arrayFixed._array = array;
    arrayFixed._count = count;
    return arrayFixed;
  }

  get length() {
    return this._array.length;
  }

  set length(length) {
    return this.truncateRight(length);
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

  reverse() {
    this._array.reverse();
    return this;
  }

  slice(begin, end) {
    if (begin == null) begin = 0;
    if (end == null) end = this._array.length;
    if (begin < 0) {
      begin = Math.max(begin + this._array.length, 0);
    }
    if (end < 0) {
      end = Math.max(end + this._array.length, 0);
    }
    let count;
    if (this._direction) {
      count = Math.max(this._count - begin, 0) - Math.max(this._count - end, 0);
    } else {
      count = Math.max(end - this._count, 0) - Math.max(begin - this._count, 0);
    }
    return ArrayFixed.fromArray(this._array.slice(begin, end), count);
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
      // $FlowFixMe: cast nully to 0
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
    this._count += items.length - deletedCount;
    const deletedItems = this._array.splice(indexStart, deleteCount, ...items);
    return ArrayFixed.fromArray(deletedItems, deletedItems.length);
  }

  map(callback) {
    const arrayNew = this._array.map((v, i) => callback(v, i, this));
    return ArrayFixed.fromArray(arrayNew, this._count);
  }

  forEach(callback) {
    this._array.forEach((v, i) => callback(v, i, this));
  }

  findIndex(callback) {
    return this._array.findIndex(callback);
  }

  collapseLeft() {
    // $FlowFixMe: Arrays are objects
    const arrayNew = _Object$keys(this._array).map(k => this._array[k]);
    arrayNew.length = this._array.length;
    this._array = arrayNew;
  }

  collapseRight() {
    // $FlowFixMe: Arrays are objects
    const arrayNew = _Object$keys(this._array).map(k => this._array[k]);
    this._array = new Array(this._array.length - arrayNew.length).concat(arrayNew);
  }

  truncateLeft(length) {
    if (length < this._array.length) {
      const truncated = this._array.splice(0, this._array.length - length);
      let count = 0;
      // $FlowFixMe: Arrays are objects
      _Object$keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array = new Array(length - this._array.length).concat(this._array);
    }
    return;
  }

  truncateRight(length) {
    if (length < this._array.length) {
      const truncated = this._array.splice(length);
      let count = 0;
      // $FlowFixMe: Arrays are objects
      _Object$keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array.length = length;
    }
    return;
  }

  caretLeft(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    if (this._count === this._array.length) {
      throw new RangeError('Careting would result in overflow');
    }
    if (!this._array.hasOwnProperty(index)) {
      this._array[index] = value;
      ++this._count;
      return;
    }
    let emptyIndex = null;
    for (let i = index - 1; i >= 0; --i) {
      if (!this._array.hasOwnProperty(i)) {
        emptyIndex = i;
        break;
      }
    }
    if (emptyIndex === null) {
      throw new RangeError('Careting would result in overflow');
    }
    this._array.copyWithin(emptyIndex, emptyIndex + 1, index + 1);
    this._array[index] = value;
    ++this._count;
    return;
  }

  caretRight(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    if (this._count === this._array.length) {
      throw new RangeError('Careting would result in overflow');
    }
    if (!this._array.hasOwnProperty(index)) {
      this._array[index] = value;
      ++this._count;
      return;
    }
    let emptyIndex = null;
    for (let i = index + 1; i < this._array.length; ++i) {
      if (!this._array.hasOwnProperty(i)) {
        emptyIndex = i;
        break;
      }
    }
    if (emptyIndex === null) {
      throw new RangeError('Careting would result in overflow');
    }
    this._array.copyWithin(index + 1, index, emptyIndex);
    this._array[index] = value;
    ++this._count;
    return;
  }

  caret(index, value, preferredDirection = true) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    if (this._count === this._array.length) {
      throw new RangeError('Careting would result in overflow');
    }
    if (!this._array.hasOwnProperty(index)) {
      this._array[index] = value;
      ++this._count;
      return;
    }
    let emptyDirectionAndIndex = null;
    let i = index - 1,
        j = index + 1;
    if (preferredDirection) {
      while (true) {
        if (i >= 0 && j < this._array.length) {
          if (!this._array.hasOwnProperty(i)) {
            emptyDirectionAndIndex = [true, i];
            break;
          }
          if (!this._array.hasOwnProperty(j)) {
            emptyDirectionAndIndex = [false, j];
            break;
          }
          --i;
          ++j;
        } else if (i >= 0) {
          if (!this._array.hasOwnProperty(i)) {
            emptyDirectionAndIndex = [true, i];
            break;
          }
          --i;
        } else if (j < this._array.length) {
          if (!this._array.hasOwnProperty(j)) {
            emptyDirectionAndIndex = [false, j];
            break;
          }
          ++j;
        } else {
          break;
        }
      }
    } else {
      while (true) {
        if (i >= 0 && j < this._array.length) {
          if (!this._array.hasOwnProperty(j)) {
            emptyDirectionAndIndex = [false, j];
            break;
          }
          if (!this._array.hasOwnProperty(i)) {
            emptyDirectionAndIndex = [true, i];
            break;
          }
          --i;
          ++j;
        } else if (i >= 0) {
          if (!this._array.hasOwnProperty(i)) {
            emptyDirectionAndIndex = [true, i];
            break;
          }
          --i;
        } else if (j < this._array.length) {
          if (!this._array.hasOwnProperty(j)) {
            emptyDirectionAndIndex = [false, j];
            break;
          }
          ++j;
        } else {
          break;
        }
      }
    }
    if (!emptyDirectionAndIndex) {
      throw new RangeError('Careting would result in overflow');
    }

    var _emptyDirectionAndInd = emptyDirectionAndIndex,
        _emptyDirectionAndInd2 = _slicedToArray(_emptyDirectionAndInd, 2);

    const emptyDirection = _emptyDirectionAndInd2[0],
          emptyIndex = _emptyDirectionAndInd2[1];

    if (emptyDirection) {
      this._array.copyWithin(emptyIndex, emptyIndex + 1, index + 1);
    } else {
      this._array.copyWithin(index + 1, index, emptyIndex);
    }
    this._array[index] = value;
    ++this._count;
    return;
  }

}

/** @module ArrayFixedDense */

/**
 * Class representing a fixed size dense array.
 * This ensures that mutation always results in a dense array.
 */
class ArrayFixedDense extends ArrayFixed {

  constructor(sizeOrArray = 0, direction_ = true) {
    if (Array.isArray(sizeOrArray)) {
      // $FlowFixMe: Arrays are objects
      const arrayNew = _Object$keys(sizeOrArray).map(k => sizeOrArray[k]);
      if (direction_) {
        arrayNew.length = sizeOrArray.length;
        sizeOrArray = arrayNew;
      } else {
        sizeOrArray = new Array(sizeOrArray.length - arrayNew.length).concat(arrayNew);
      }
    }
    super(sizeOrArray);
    this._direction = direction_;
  }

  /**
   * Construct from reference.
   * This skips the integrity process in the normal constructor.
   * The array must already be dense, and have the correct count and direction.
   */
  static fromArray(array, count, direction_ = true) {
    const arrayFixedDense = new ArrayFixedDense(array.length);
    arrayFixedDense._array = array;
    arrayFixedDense._count = count;
    arrayFixedDense._direction = direction_;
    return arrayFixedDense;
  }

  get direction() {
    return this._direction;
  }

  switchDirection(direction_) {
    if (direction_ !== this._direction) {
      if (direction_) {
        super.collapseLeft();
      } else {
        super.collapseRight();
      }
      this._direction = direction_;
    }
  }

  collapseLeft() {
    return;
  }

  collapseRight() {
    return;
  }

  set(index, value) {
    // we always start with a dense array
    // if we are just replacing an element
    // there's no problem
    if (!this._array.hasOwnProperty(index)) {
      if (index >= this._array.length || index < 0) {
        throw new RangeError('Out of range index');
      }
      // find the next or previous open slot
      if (this._direction) {
        index = this._count;
      } else {
        index = this._array.length - this._count - 1;
      }
    }
    return super.set(index, value);
  }

  unset(index) {
    if (this._array.hasOwnProperty(index)) {
      if (index >= this._array.length || index < 0) {
        throw new RangeError('Out of range index');
      }
      const lengthOrig = this._array.length;
      super.unset(index);
      if (this._direction) {
        this._array.copyWithin(index, index + 1);
        delete this._array[this._array.length - 1];
      } else {
        this._array.copyWithin(1, 0, index);
        delete this._array[0];
      }
      return true;
    } else {
      return false;
    }
  }

  reverse() {
    let swapStart, swapMid;
    if (this._direction) {
      swapStart = 0;
      swapMid = Math.floor(this._count / 2);
      for (let i = swapStart; i < swapMid; ++i) {
        var _ref = [this._array[this._count - i - 1], this._array[i]];

        // $FlowFixMe: Destructuring swap
        this._array[i] = _ref[0];

        // $FlowFixMe: Destructuring swap
        this._array[this._count - i - 1] = _ref[1];
      }
    } else {
      swapStart = this._array.length - this._count;
      swapMid = Math.floor(this._count / 2) + swapStart;
      for (let i = swapStart; i < swapMid; ++i) {
        var _ref2 = [
        // $FlowFixMe: Destructuring swap
        this._array[this._array.length - i + swapStart - 1], this._array[i]];

        // $FlowFixMe: Destructuring swap
        this._array[i] = _ref2[0];

        // $FlowFixMe: Destructuring swap
        this._array[this._array.length - i + swapStart - 1] = _ref2[1];
      }
    }
    return this;
  }

  slice(begin, end) {
    if (begin == null) begin = 0;
    if (end == null) end = this._array.length;
    if (begin < 0) {
      begin = Math.max(begin + this._array.length, 0);
    }
    if (end < 0) {
      end = Math.max(end + this._array.length, 0);
    }
    let count;
    if (this._direction) {
      count = Math.max(this._count - begin, 0) - Math.max(this._count - end, 0);
    } else {
      count = Math.max(end - this._count, 0) - Math.max(begin - this._count, 0);
    }
    return ArrayFixedDense.fromArray(this._array.slice(begin, end), count, this._direction);
  }

  splice(indexStart, deleteCount, ...items) {
    if (indexStart < 0) {
      indexStart = Math.max(indexStart + this._array.length, 0);
    }
    if (this._direction) {
      if (indexStart > this._count) {
        indexStart = this._count;
      }
    } else {
      if (indexStart < this._array.length - this._count - 1) {
        indexStart = this._array.length - this._count - 1;
      }
    }
    // deleteCount is set to the rest of the array if only indexStart is set
    if (arguments.length === 1) {
      deleteCount = this._array.length - indexStart;
    } else {
      // $FlowFixMe: cast nully to 0
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
    this._count += items.length - deletedCount;
    const deletedItems = this._array.splice(indexStart, deleteCount, ...items);
    return ArrayFixedDense.fromArray(deletedItems, deletedItems.length, this._direction);
  }

  map(callback) {
    const arrayNew = this._array.map((v, i) => callback(v, i, this));
    return ArrayFixedDense.fromArray(arrayNew, this._count, this._direction);
  }

  forEach(callback) {
    this._array.forEach((v, i) => callback(v, i, this));
  }

  caretLeft(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    // if the array is full
    // or that the index is within the dense left partition
    // then the array would overflow
    if (this._count === this._array.length || this._direction && index < this._count) {
      throw new RangeError('Careting would result in overflow');
    }
    // we use this.set to make sure density is ensured
    if (!this._array.hasOwnProperty(index)) {
      // ensure density
      if (this._direction) {
        index = this._count;
      } else {
        index = this._array.length - this._count - 1;
      }
    } else {
      // at this point the this._direction must be false
      // we can memmove left and set
      const emptyIndex = this._array.length - this._count - 1;
      this._array.copyWithin(emptyIndex, emptyIndex + 1, index + 1);
    }
    this._array[index] = value;
    ++this._count;
    return;
  }

  caretRight(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    // if the array is full
    // or that the index is within the dense right partition
    // then the array would overflow
    if (this._count === this._array.length || !this._direction && index >= this._array.length - this._count) {
      throw new RangeError('Careting would result in overflow');
    }
    if (!this._array.hasOwnProperty(index)) {
      // ensure density
      if (this._direction) {
        index = this._count;
      } else {
        index = this._array.length - this._count - 1;
      }
    } else {
      // at this point the this._direction must be true
      // we can memmove right and set
      const emptyIndex = this._count + 1;
      this._array.copyWithin(index + 1, index, emptyIndex);
    }
    this._array[index] = value;
    ++this._count;
    return;
  }

  caret(index, value) {
    // the preferred direction is the opposite direction of this dense array
    if (this._direction) {
      return this.caretRight(index, value);
    } else {
      return this.caretLeft(index, value);
    }
  }

}

exports['default'] = ArrayFixed;
exports.ArrayFixedDense = ArrayFixedDense;
