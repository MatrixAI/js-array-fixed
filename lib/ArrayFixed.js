// @flow
/** @module ArrayFixed */

/**
 * Class representing a fixed size array.
 */
class ArrayFixed<child> {

  _array: Array<child>;
  _count: number;
  _indexFirst: ?number;
  _indexLast: ?number;

  constructor (size: number) {
    this._array = new Array(size);
    this._count = 0;
    this._indexFirst = null;
    this._indexLast = null;
  }

  static fromArray (arrayNew: Array<child>): ArrayFixed<child> {
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

  get size (): number {
    return this._array.length;
  }

  get count (): number {
    return this._count;
  }

  get indexFirst (): ?number {
    return this._indexFirst;
  }

  get indexLast (): ?number {
    return this._indexLast;
  }

  // $FlowFixMe: computed property
  [Symbol.iterator] (): Iterator<child> {
    return this._array.values();
  }

  toArray (): Array<child> {
    return [...this._array];
  }

  get (index: number): ?child {
    if (index >= this._array.length || index < 0) {
      throw new RangeError();
    }
    return this._array[index];
  }

  set (index: number, value: child): void {
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

  delete (index: number): boolean {
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

  splice (indexStart: number, deleteCount: ?number, ...items: Array<child>) {
    if (indexStart > this._array.length) {
      indexStart = this._array.length;
    } else if (indexStart < 0) {
      indexStart = Math.max(indexStart + this._array.length, 0);
    }
    for (let i = this._array.length - 1; i >= this._array.length - items.length; --i) {
      if (this._array.hasOwnProperty(i)) throw new RangeError('Cannot splice ');
    }
    let deletedCount = 0;
    for (let i = 0; i < deleteCount; ++i) {
      if (this._array.hasOwnProperty(indexStart + i)) ++deletedCount;
    }
    const lengthOriginal = this._array.length;
    this._array.splice(indexStart, deleteCount, ...items);
    this._array.length = lengthOriginal;
    this._count += items.length - deletedCount;
  }


  collapseLeft (): void {
    const arrayNew = new Array(this._array.length);
    let counter = 0;
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

  collapseRight (): void {
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

export default ArrayFixed;
