// @flow
/** @module ArrayFixedDense */

import ArrayFixed from './ArrayFixed.js';

/**
 * Class representing a fixed size dense array.
 * This ensures that mutation always results in a dense array.
 */
class ArrayFixedDense<item, direction: boolean> extends ArrayFixed<item> {

  _direction: direction;

  constructor (
    sizeOrArray: number|Array<item> = 0,
    direction_: direction = true
  ) {
    if (Array.isArray(sizeOrArray)) {
      // $FlowFixMe: Arrays are objects
      const arrayNew = Object.keys(sizeOrArray).map((k) => sizeOrArray[k]);
      if (direction_) {
        arrayNew.length = sizeOrArray.length;
        sizeOrArray = arrayNew;
      } else {
        sizeOrArray = (
          new Array(sizeOrArray.length - arrayNew.length)
        ).concat(arrayNew);
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
  static fromArray<direction: boolean> (
    array: Array<item>,
    count: number,
    direction_: direction = true
  ): ArrayFixedDense<item, direction> {
    const arrayFixedDense = new ArrayFixedDense(array.length);
    arrayFixedDense._array = array;
    arrayFixedDense._count = count;
    arrayFixedDense._direction = direction_;
    return arrayFixedDense;
  }

  get direction (): boolean {
    return this._direction;
  }

  switchDirection (direction_: direction): void {
    if (direction_ !== this._direction) {
      if (direction_) {
        super.collapseLeft();
      } else {
        super.collapseRight();
      }
      this._direction = direction_;
    }
  }

  collapseLeft (): void {
    return;
  }

  collapseRight (): void {
    return;
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

  reverse (): ArrayFixedDense<item, direction> {
    let swapStart, swapMid;
    if (this._direction) {
      swapStart = 0;
      swapMid = Math.floor(this._count / 2);
      for (let i = swapStart; i < swapMid; ++i) {
        [
          // $FlowFixMe: Destructuring swap
          this._array[i],
          // $FlowFixMe: Destructuring swap
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
          // $FlowFixMe: Destructuring swap
          this._array[i],
          // $FlowFixMe: Destructuring swap
          this._array[this._array.length - i + swapStart - 1]
        ] = [
          // $FlowFixMe: Destructuring swap
          this._array[this._array.length - i + swapStart - 1],
          this._array[i]
        ];
      }

    }
    return this;
  }

  slice (
    begin: number = 0,
    end: number = this._array.length
  ): ArrayFixedDense<item, direction> {
    begin = Math.trunc(begin);
    end = Math.trunc(end);
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
    return ArrayFixedDense.fromArray(
      this._array.slice(begin, end),
      count,
      this._direction
    );
  }

  splice (
    indexStart: number = 0,
    deleteCount: ?number,
    ...items: Array<item>
  ): ArrayFixedDense<item, direction> {
    indexStart = Math.trunc(indexStart);
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
      // $FlowFixMe: casts nully to 0 AND also truncates to integer
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
    callback: (item, number, ArrayFixedDense<item, direction>) => itemNew
  ): ArrayFixedDense<itemNew, direction> {
    const arrayNew = this._array.map((v, i) => callback(v, i, this));
    return ArrayFixedDense.fromArray(arrayNew, this._count, this._direction);
  }

  forEach (
    callback: (item, number, ArrayFixedDense<item, direction>) => any
  ): void {
    this._array.forEach((v, i) => callback(v, i, this));
  }

  caretLeft (index: number, value: item): void {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    // if the array is full
    // or that the index is within the dense left partition
    // then the array would overflow
    if (
      this._count === this._array.length ||
      (this._direction && index < this._count)
    ) {
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

  caretRight (index: number, value: item): void {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    // if the array is full
    // or that the index is within the dense right partition
    // then the array would overflow
    if (
      this._count === this._array.length ||
      (!this._direction && index >= (this._array.length - this._count))
    ) {
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

  caret (index: number, value: item): void {
    // the preferred direction is the opposite direction of this dense array
    if (this._direction) {
      return this.caretRight(index, value);
    } else {
      return this.caretLeft(index, value);
    }
  }

}

export default ArrayFixedDense;
