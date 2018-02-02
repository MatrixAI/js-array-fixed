// @flow
/** @module ArrayFixedDense */

import ArrayFixed from './ArrayFixed.js';

/**
 * Class representing a fixed size dense array.
 * This ensures that mutation always results in a dense array.
 */
class ArrayFixedDense<item> extends ArrayFixed<item> {

  _direction: boolean;

  constructor (
    sizeOrArray: number|Array<item> = 0,
    direction: boolean = true
  ) {
    if (Array.isArray(sizeOrArray)) {
      const arrayNew = Object.keys(sizeOrArray).map((k) => sizeOrArray[k]);
      if (direction) {
        arrayNew.length = sizeOrArray.length;
        sizeOrArray = arrayNew;
      } else {
        sizeOrArray = (
          new Array(sizeOrArray.length - arrayNew.length)
        ).concat(arrayNew);
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
  static fromArray (
    array: Array<item>,
    count: number,
    direction: boolean
  ): ArrayFixedDense<item> {
    const arrayFixedDense = new ArrayFixedDense(array.length);
    arrayFixedDense._array = array;
    arrayFixedDense._count = count;
    arrayFixedDense._direction = direction;
    return arrayFixedDense;
  }

  switchDirection (direction: boolean) {
    if (direction !== this._direction) {
      if (direction) {
        super.collapseLeft();
      } else {
        super.collapseRight();
      }
      this._direction = direction;
    }
  }

  set (index: number, value: item): void {
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

  unset (index: number): boolean {
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

  reverse (): ArrayFixedDense<item> {
    let swapStart, swapMid;
    if (this._direction) {
      swapStart = 0;
      swapMid = Math.floor(this._count / 2);
      for (let i = swapStart; i < swapMid; ++i) {
        [
          this._array[i],
          this._array[this._count - i - 1]
        ] = [
          this._array[this._count - i - 1],
          this._array[i]
        ];
      }
    } else {
      swapStart = this._array.length - this._count;
      swapMid = Math.floor(this._count / 2) + swapStart;
      for (let i = swapStart; i < swapMid; ++i) {
        [
          this._array[i],
          this._array[this._array.length - i + swapStart - 1]
        ] = [
          this._array[this._array.length - i + swapStart - 1],
          this._array[i]
        ];
      }

    }
    return this;
  }

  slice (begin: ?number, end: ?number): ArrayFixedDense<item> {
    return ArrayFixedDense.fromArray(this._array.slice(begin, end));
  }

  splice (
    indexStart: number,
    deleteCount: ?number,
    ...items: Array<item>
  ): ArrayFixedDense<item> {
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
      deleteCount = deleteCount|0;
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
    return ArrayFixedDense.fromArray(
      deletedItems,
      deletedItems.length,
      this._direction
    );
  }

  map<itemNew> (
    callback: (item, number) => itemNew
  ): ArrayFixedDense<itemNew> {
    const arrayNew = this._array.map((v, i) => callback(v, i));
    return ArrayFixedDense.fromArray(arrayNew, this._count, this._direction);
  }

}

export default ArrayFixedDense;