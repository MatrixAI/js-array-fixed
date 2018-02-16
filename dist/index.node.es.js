import _getIterator from 'babel-runtime/core-js/get-iterator';
import _Symbol$iterator from 'babel-runtime/core-js/symbol/iterator';
import _Object$keys from 'babel-runtime/core-js/object/keys';

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
    const arrayNew = this._array.map((v, i) => callback(v, i));

    return ArrayFixed.fromArray(arrayNew, this._count);
  }

  findIndex(callback) {
    return this._array.findIndex(callback);
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

  truncateLeft(length) {
    if (length < this._array.length) {
      const truncated = this._array.splice(0, this._array.length - length);
      let count = 0;
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
      _Object$keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array.length = length;
    }
    return;
  }

}

/** @module ArrayFixedDense */

/**
 * Class representing a fixed size dense array.
 * This ensures that mutation always results in a dense array.
 */
class ArrayFixedDense extends ArrayFixed {

  constructor(sizeOrArray = 0, direction = true) {
    if (Array.isArray(sizeOrArray)) {
      const arrayNew = _Object$keys(sizeOrArray).map(k => sizeOrArray[k]);
      if (direction) {
        arrayNew.length = sizeOrArray.length;
        sizeOrArray = arrayNew;
      } else {
        sizeOrArray = new Array(sizeOrArray.length - arrayNew.length).concat(arrayNew);
      }
    }
    super(sizeOrArray);
    this._direction = direction;
  }

  /**
   * Construct from reference.
   * This skips the integrity process in the normal constructor.
   * The array must already be dense, and have the correct count and direction.
   */
  static fromArray(array, count, direction) {
    const arrayFixedDense = new ArrayFixedDense(array.length);
    arrayFixedDense._array = array;
    arrayFixedDense._count = count;
    arrayFixedDense._direction = direction;
    return arrayFixedDense;
  }

  switchDirection(direction) {
    if (direction !== this._direction) {
      if (direction) {
        super.collapseLeft();
      } else {
        super.collapseRight();
      }
      this._direction = direction;
    }
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
        this._array[i] = _ref[0];
        this._array[this._count - i - 1] = _ref[1];
      }
    } else {
      swapStart = this._array.length - this._count;
      swapMid = Math.floor(this._count / 2) + swapStart;
      for (let i = swapStart; i < swapMid; ++i) {
        var _ref2 = [this._array[this._array.length - i + swapStart - 1], this._array[i]];
        this._array[i] = _ref2[0];
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
    const arrayNew = this._array.map((v, i) => callback(v, i));
    return ArrayFixedDense.fromArray(arrayNew, this._count, this._direction);
  }

}

export { ArrayFixedDense };
export default ArrayFixed;
