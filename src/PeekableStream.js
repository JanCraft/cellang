export class PeekableStream {
    constructor(iterator) {
        this.iter = iterator[Symbol.iterator]();
        this.next = undefined;
        this._fill();
    }

    clone() {
        return this;
    }

    _fill() {
        this.next = this.iter.next();
    }

    move_next() {
        const ret = this.next;
        this._fill();
        return ret;
    }
}