// @flow
/** @module ArrayFixed */

/**
 * Class representing a fixed size array.
 * Functions will respect the set size.
 * This also maintains a count of the non-empty items.
 */
class ArrayFixed<item> {

  _count: number = 0;
  _array: Array<item>;

  constructor (sizeOrArray: number|Array<item> = 0) {
    if (typeof sizeOrArray === 'number') {
      this._array = new Array(sizeOrArray);
    } else {
      let count = 0;
      Object.keys(sizeOrArray).map(() => {
        ++count;
      });
      this._count = count;
      this._array = sizeOrArray.slice(); // slice preserves sparsity
    }
  }

  get length (): number {
    return this._array.length;
  }

  set length (length: number): void {
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

  slice (begin: ?number, end: ?number): Array<item> {
    return this._array.slice(begin, end);
  }

  splice (indexStart: number, deleteCount: ?number, ...items: Array<item>): Array<item> {
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
    const deletedItems = this._array.splice(indexStart, deleteCount, ...items);
    this._count += items.length - deletedCount;
    return deletedItems;
  }

  map<itemNew> (callback: (item, number, Array<item>) => itemNew) {
    return new ArrayFixed(this._array.map(callback));
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

}

export default ArrayFixed;
