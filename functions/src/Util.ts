import {Config} from "./Config";

declare global {
    interface Number {
        toFloor(): number;

        getRandom(): number;

        getRandomF(): number;
    }

    interface Array<T> {
        getRandom(): T;

        deleteItem(item: T): Array<T>;

        contains(item: T): boolean;

        addRandom(array: Array<T>): any;

        // pushs unique random number to array
        pushRandomNumber(number: number): any;

        last(): T;

        copy(): Array<T>;

        shuffle(): Array<T>;
    }
}
Number.prototype.toFloor = function (this: number): number {
    return Math.floor(this);
};
// RETURN FLOORED VALUE [0..this)
Number.prototype.getRandom = function (this: number): number {
    return Math.floor(Math.random() * this);
};
Number.prototype.getRandomF = function (this: number): number {
    return Math.random() * this;
};
Array.prototype.getRandom = function <T>(this: T[]): T {
    return this[this.length.getRandom()];
};
Array.prototype.deleteItem = function <T>(this: T[], item: T): Array<T> {
    if (this.indexOf(item) !== -1)
        this.splice(this.indexOf(item), 1);
    return this;
};
Array.prototype.contains = function <T>(this: T[], item: T): any {
    return this.indexOf(item) !== -1
};
Array.prototype.addRandom = function <T>(this: T[], array: Array<T>) {
    const index = this.length;

    do this[index] = array.getRandom();
    while (this.indexOf(this[index]) !== index);
};
Array.prototype.pushRandomNumber = function <T>(this: number[], number: number) {
    const index = this.length;
    do this[index] = number.getRandom();
    while (this.indexOf(this[index]) !== index);

    return this[index];
};
Array.prototype.last = function <T>(this: T[]): T {
    return this[this.length - 1];
};
Array.prototype.copy = function <T>(this: T[]): Array<T> {
    return this.slice();
};

Array.prototype.shuffle = function <T>(this: T[]): Array<T> {
    return this.sort(() => Math.random() - 0.3);
};

export class Utils {
    static getRandomFromBound(axis: string) {
        let value = Utils.getRandomFromRangeF(Config.Bounds[axis][0], Config.Bounds[axis][1]);
        if (Math.abs(value) <= 0.3)
            value = 0;
        return value * (Utils.withChance(0.5) ? 1 : -1);
    }

    static getRandomOrZeroFromBound(axis: string) {
        if (this.withChance(0.2))
            return 0;
        else {
            const sign = Utils.withChance(0.5) ? 1 : -1,
                value = Utils.getRandomFromRangeF(Config.Bounds[axis][0], Config.Bounds[axis][1]);
            return sign * value;
        }
    }

    static getRandomNonZeroFromBound(axis: string): number {
        let value = Utils.getRandomFromRangeF(Config.Bounds[axis][0], Config.Bounds[axis][1]);

        if (Math.abs(value) <= Config.Threshold[axis])
            value = 0;

        if (value === 0)
            return Utils.getRandomNonZeroFromBound(axis);
        return value
    }

    static getRandomWithSign(axis: string, _number: number): number {
        return Math.abs(this.getRandomNonZeroFromBound(axis)) * Math.sign(_number)
    }

    static getRandomFromRangeF(min: number, max: number) {
        return min + (max - min).getRandomF();
    }
    static getRandomFromRange(min: number, max:number) {
        return Math.round(this.getRandomFromRangeF(min, max))
    }

    static withChance(value: number) {
        return Math.random() <= value;
    }


}