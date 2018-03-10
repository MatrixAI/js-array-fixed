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
      // $FlowFixMe: Arrays are objects
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

  slice (
    begin: number = 0,
    end: number = this._array.length
  ): ArrayFixed<item> {
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
    return ArrayFixed.fromArray(this._array.slice(begin, end), count);
  }

  splice (
    indexStart: number = 0,
    deleteCount: ?number,
    ...items: Array<item>
  ): ArrayFixed<item> {
    indexStart = Math.trunc(indexStart);
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
    return ArrayFixed.fromArray(deletedItems, deletedItems.length);
  }

  map<itemNew> (
    callback: (item, number, ArrayFixed<item>) => itemNew
  ): ArrayFixed<itemNew> {
    const arrayNew = this._array.map((v, i) => callback(v, i, this));
    return ArrayFixed.fromArray(arrayNew, this._count);
  }

  forEach (
    callback: (item, number, ArrayFixed<item>) => any
  ): void {
    this._array.forEach((v, i) => callback(v, i, this));
  }

  findIndex (
    callback: (item) => boolean
  ): number {
    return this._array.findIndex(callback);
  }

  collapseLeft (): void {
    // $FlowFixMe: Arrays are objects
    const arrayNew = Object.keys(this._array).map((k) => this._array[k]);
    arrayNew.length = this._array.length;
    this._array = arrayNew;
  }

  collapseRight (): void {
    // $FlowFixMe: Arrays are objects
    const arrayNew = Object.keys(this._array).map((k) => this._array[k]);
    this._array = (
      new Array(this._array.length - arrayNew.length)
    ).concat(arrayNew);
  }

  truncateLeft (length: number): void {
    if (length < this._array.length) {
      const truncated = this._array.splice(0, this._array.length - length);
      let count = 0;
      // $FlowFixMe: Arrays are objects
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
      // $FlowFixMe: Arrays are objects
      Object.keys(truncated).map(() => {
        ++count;
      });
      this._count -= count;
    } else {
      this._array.length = length;
    }
    return;
  }

  caretLeft (index: number, value: item): void {
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

  caretRight (index: number, value: item) {
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

  caret (
    index: number,
    value: item,
    preferredDirection: boolean = true,
  ): void {
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
    let i = index - 1, j = index + 1;
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
    const [emptyDirection, emptyIndex] = emptyDirectionAndIndex;
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

export default ArrayFixed;
