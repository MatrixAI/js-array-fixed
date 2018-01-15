'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _Symbol$iterator = _interopDefault(require('babel-runtime/core-js/symbol/iterator'));

/** @module ArrayFixed */

/**
 * Class representing a fixed size array.
 */
class ArrayFixed {

  constructor(size) {
    this._array = new Array(size);
    this._count = 0;
    this._indexFirst = null;
    this._indexLast = null;
  }

  static fromArray(arrayNew) {
    let count = 0;
    let indexFirst = null;
    let indexLast = null;
    arrayNew.forEach((value, index) => {
      if (count === 0) indexFirst = index;
      indexLast = index;
      ++count;
    });
    const arrayFixed = new ArrayFixed(arrayNew.length);
    arrayFixed._array = arrayNew;
    arrayFixed._count = count;
    arrayFixed._indexFirst = indexFirst;
    arrayFixed._indexLast = indexLast;
    return arrayFixed;
  }

  get size() {
    return this._array.length;
  }

  get count() {
    return this._count;
  }

  get indexFirst() {
    return this._indexFirst;
  }

  get indexLast() {
    return this._indexLast;
  }

  // $FlowFixMe: computed property
  [_Symbol$iterator]() {
    return this._array.values();
  }

  toArray() {
    return [...this._array];
  }

  get(index) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError();
    }
    return this._array[index];
  }

  set(index, value) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError();
    }
    if (!this._array.hasOwnProperty(index)) {
      this._array[index] = value;
      ++this._count;
    } else {
      this._array[index] = value;
    }
    if (this._indexFirst == null || index < this._indexFirst) {
      this._indexFirst = index;
    }
    if (this._indexLast == null || index > this._indexLast) {
      this._indexLast = index;
    }
    return;
  }

  delete(index) {
    if (index >= this._array.length || index < 0) {
      throw new RangeError();
    }
    if (this._array.hasOwnProperty(index)) {
      delete this._array[index];
      --this._count;
      if (this._count === 0) {
        this._indexFirst = null;
        this._indexLast = null;
      } else if (this._count === 1) {
        // short circuiting find of the first defined element
        this._array.some((value, index) => {
          this._indexFirst = index;
          this._indexLast = index;
          return true;
        });
      } else {
        if (index === this._indexFirst) {
          this._array.some((value, index) => {
            this._indexFirst = index;
            return true;
          });
        } else if (index === this._indexLast) {
          for (let i = this._array.length - 1; i >= 0; --i) {
            if (this._array.hasOwnProperty(i)) {
              this._indexLast = i;
              break;
            }
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

  collapseLeft() {
    const arrayNew = new Array(this._array.length);
    let counter = 0;
    // we should be using forEach
    this._array.forEach((value, index) => {
      arrayNew[counter] = this._array[index];
      ++counter;
    });
    this._array = arrayNew;
    if (this._count > 0) {
      this._indexFirst = 0;
      this._indexLast = this._count - 1;
    }
  }

  collapseRight() {
    const arrayNew = new Array(this._array.length);
    let counter = this._array.length - 1;
    this._array.forEach((value, index) => {
      arrayNew[counter] = this._array[index];
      --counter;
    });
    this._array = arrayNew;
    if (this._count > 0) {
      this._indexFirst = this._array.length - this.count;
      this._indexLast = this._array.length - 1;
    }
  }

}

module.exports = ArrayFixed;
