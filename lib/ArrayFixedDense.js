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
      // $FlowFixMe: Arrays are objects
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
    direction: boolean = true
  ): ArrayFixedDense<item> {
    const arrayFixedDense = new ArrayFixedDense(array.length);
    arrayFixedDense._array = array;
    arrayFixedDense._count = count;
    arrayFixedDense._direction = direction;
    return arrayFixedDense;
  }

  get direction (): boolean {
    return this._direction;
  }

  switchDirection (direction: boolean): void {
    if (direction !== this._direction) {
      if (direction) {
        super.collapseLeft();
      } else {
        super.collapseRight();
      }
      this._direction = direction;
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

  reverse (): ArrayFixedDense<item> {
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
  ): ArrayFixedDense<item> {
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
  ): ArrayFixedDense<item> {
    indexStart = Math.trunc(indexStart);
    if (indexStart < 0) {
      indexStart = Math.max(indexStart + this._array.length, 0);
    } else {
      indexStart = Math.min(indexStart, this._array.length);
    }
    // deleteCount is set to the rest of the array if only indexStart is set
    if (arguments.length === 1) {
      deleteCount = this._array.length - indexStart;
    } else {
      // $FlowFixMe: casts nully to 0 AND also truncates to integer
      deleteCount = deleteCount|0;
      // the minimum deleteCount is 0
      deleteCount = Math.max(deleteCount, 0);
      // the maximum deleteCount is the length where the indexStart starts
      deleteCount = Math.min(deleteCount, this._array.length - indexStart);
    }
    // for dense arrays
    // the splice range may be at the empty range
    // if so, in order to efficiently splice
    // we need to shift the indexStart
    // to be adjacent to the filled range
    // however we cannot do this if the
    // splice range includes an empty element
    // as that would be against the semantics of splice
    if (this._direction) {
      // if the beginning of the splice is empty
      // shift the indexStart to the end of a left-dense array
      if (!this._array.hasOwnProperty(indexStart)) {
        indexStart = this._count;
      }
    } else {
      // if the end of the splice is empty
      // shift the indexStart to the start + deleteCount of a right-dense array
      if (!this._array.hasOwnProperty(indexStart + deleteCount - 1)) {
        indexStart = this._array.length - this._count - deleteCount;
      }
    }
    // count how many set items are deleted
    let deletedCount = 0;
    for (let i = 0; i < deleteCount; ++i) {
      if (this._array.hasOwnProperty(indexStart + i)) ++deletedCount;
    }
    if (this._count - deletedCount + items.length > this._array.length) {
      throw RangeError('Splicing will result in overflow');
    }
    const lengthOrig = this._array.length;
    const deletedItems = this._array.splice(indexStart, deleteCount, ...items);
    // a left dense array can be easily readjusted by truncation
    // a right dense array is more complicated
    // either we pad the array from the left using concat
    // or we have to memmove the contents to the left
    // and then truncate
    if (this._direction) {
      // truncate the array to the appropriate length
      this._array.length = lengthOrig;
    } else {
      if (deleteCount > items.length) {
        // pad the array from the left
        this._array = (new Array(
          Math.min(deleteCount - items.length, lengthOrig)
        )).concat(this._array);
      } else if (deleteCount < items.length) {
        // move the array left then truncate
        this._array.copyWithin(0, this._array.length - lengthOrig);
        this._array.length = lengthOrig;
      }
    }
    this._count += items.length - deletedCount;
    return ArrayFixedDense.fromArray(
      deletedItems,
      deletedCount,
      this._direction
    );
  }

  map<itemNew> (
    callback: (item, number, ArrayFixedDense<item>) => itemNew
  ): ArrayFixedDense<itemNew> {
    const arrayNew = this._array.map((v, i) => callback(v, i, this));
    return ArrayFixedDense.fromArray(arrayNew, this._count, this._direction);
  }

  forEach (
    callback: (item, number, ArrayFixedDense<item>) => any
  ): void {
    this._array.forEach((v, i) => callback(v, i, this));
  }

  caretLeft (index: number, value: item): number {
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
    return index;
  }

  caretRight (index: number, value: item): number {
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
    return index;
  }

  caret (index: number, value: item): number {
    // the preferred direction is the opposite direction of this dense array
    if (this._direction) {
      return this.caretRight(index, value);
    } else {
      return this.caretLeft(index, value);
    }
  }

}

export default ArrayFixedDense;
