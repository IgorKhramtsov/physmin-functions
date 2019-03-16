import {Config} from "./Config";

declare global {
    interface Number {
        toFloor(): number;

        getRandom(): number;

        getRandomF(): number;
    }

    interface Array<T> {
        getRandom(): T;

        deleteItem(item: T): any;
    }
}
Number.prototype.toFloor = function (this: number): number {
    return Math.floor(this);
};
Number.prototype.getRandom = function (this: number): number {
    return Math.floor(Math.random() * this);
};
Number.prototype.getRandomF = function (this: number): number {
    return Math.random() * this;
};
Array.prototype.getRandom = function <T>(this: T[]): T {
    return this[this.length.getRandom()];
};
Array.prototype.deleteItem = function <T>(this: T[], item: T): any {
    if (this.indexOf(item) != -1)
        this.splice(this.indexOf(item), 1);
    return this;
};

export class Utils {
    static getRandomFromBound(axis: string) {
        let value = Utils.getRandomFromRange(Config.bounds[axis][0], Config.bounds[axis][1]);
        if (Math.abs(value) <= 0.3)
            value = 0;
        return value
    }

    static getRandomNonZeroFromBound(axis: string): number {
        let value = Utils.getRandomFromRange(Config.bounds[axis][0], Config.bounds[axis][1]);
        if (Math.abs(value) <= 0.3)
            value = 0;

        if (value == 0)
            return Utils.getRandomNonZeroFromBound(axis);
        return value
    }

    static  getRandomFromRange(min: number, max: number) {
        return min + (max - min).getRandomF();
    }

    static  withChance(value: number) {
        return Math.random() <= value;
    }
}
