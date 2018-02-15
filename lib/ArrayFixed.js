// @flow
/** @module ArrayFixed */

/**
 * Class representing a fixed size array.
 * Functions will respect the set size.
 * This also maintains a count of the non-empty items.
 */
class ArrayFixed<item> {

  _array: Array<item>;
  _count: number = 0;

  constructor (sizeOrArray: number|Array<item> = 0) {
    if (typeof sizeOrArray === 'number') {
      this._array = new Array(sizeOrArray);
    } else {
      let count = 0;
      Object.keys(sizeOrArray).map(() => {
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
  static fromArray (array: Array<item>, count: number): ArrayFixed<item> {
    const arrayFixed = new ArrayFixed(array.length);
    arrayFixed._array = array;
    arrayFixed._count = count;
    return arrayFixed;
  }

  get length (): number {
    return this._array.length;
  }

  set length (length: number): void {
    return this.truncateRight(length);
  }

  get count (): number {
    return this._count;
  }

  // $FlowFixMe: computed property
  [Symbol.iterator] (): Iterator<item> {
    return this._array[Symbol.iterator]();
  }

  toArray (): Array<item> {
    return this._array.slice(); // slice preserves sparsity
  }

  get (index: number): ?item {
    if (index >= this._array.length || index < 0) {
      throw new RangeError('Out of range index');
    }
    return this._array[index];
  }

  set (index: number, value: item): void {
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

  unset (index: number): boolean {
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

  reverse (): ArrayFixed<item> {
    this._array.reverse();
    return this;
  }

  slice (begin: ?number, end: ?number): ArrayFixed<item> {
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

  splice (
    indexStart: number,
    deleteCount: ?number,
    ...items: Array<item>
  ): ArrayFixed<item> {
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
    return ArrayFixed.fromArray(deletedItems, deletedItems.length);
  }

  map<itemNew> (
    callback: (item, number) => itemNew
  ): ArrayFixed<itemNew> {
    const arrayNew = this._array.map((v, i) => callback(v, i));

    return ArrayFixed.fromArray(arrayNew, this._count);
  }

  collapseLeft (): void {
    const arrayNew = Object.keys(this._array).map((k) => this._array[k]);
    arrayNew.length = this._array.length;
    this._array = arrayNew;
  }

  collapseRight (): void {
    const arrayNew = Object.keys(this._array).map((k) => this._array[k]);
    this._array = (
      new Array(this._array.length - arrayNew.length)
    ).concat(arrayNew);
  }

  truncateLeft (length: number): void {
    if (length < this._array.length) {
      const truncated = this._array.splice(0, this._array.length - length);
      let count = 0;
      Object.keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array = (new Array(length - this._array.length)).concat(this._array);
    }
    return;
  }

  truncateRight (length: number): void {
    if (length < this._array.length) {
      const truncated = this._array.splice(length);
      let count = 0;
      Object.keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array.length = length;
    }
    return;
  }

}

export default ArrayFixed;
