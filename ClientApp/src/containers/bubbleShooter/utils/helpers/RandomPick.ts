import { Point } from "pixi.js-legacy";
import { getRandomInt, getRandomFloat } from "../../../../utils/random";

type Randomizable = number | Point | any[];

class RandomPick<
  T extends Randomizable,
  S = T extends any[] ? undefined : T,
  A = T extends any[] ? T : undefined
> {
  public start: S = undefined as unknown as S;
  public end: S = undefined as unknown as S;
  public array: A = undefined as unknown as A;

  private range: S = undefined as unknown as S;
  private tries = 10;
  private dupPercentRange = 0.3;
  private lastVal?: S;
  private lastArrIdx?: number;

  constructor(start: T, end?: S) {
    if (Array.isArray(start)) {
      this.array = start as unknown as A;
    } else {
      this.start = start as Exclude<T, any[]> as unknown as S;
      this.end = end ?? this.start;

      if (typeof this.start === "number" && typeof this.end === "number") {
        this.range = Math.abs(this.start - this.end) as unknown as S;
      } else {
        this.range = new Point(
          Math.abs(
            (this.start as unknown as Point).x -
              (this.end as unknown as Point).x
          ),
          Math.abs(
            (this.start as unknown as Point).y -
              (this.end as unknown as Point).y
          )
        ) as unknown as S;
      }
    }
  }

  getRandom(): T extends any[] ? T[number] : T {
    type Result = T extends any[] ? T[number] : T;

    if (this.array) {
      const array = this.array as unknown as any[];
      if (!array.length) throw new Error("Array is empty");

      let idx = getRandomInt(0, array.length - 1);
      let val = array[idx] as Result;
      for (let i = 0; i < this.tries; i++) {
        if (this.lastArrIdx === undefined || idx !== this.lastArrIdx) {
          val = array[idx];
          break;
        }

        idx = getRandomInt(0, array.length - 1);
      }
      this.lastArrIdx = idx;

      return val;
    }

    if (typeof this.start === "number" && typeof this.end === "number") {
      const allowedRange =
        (this.range as unknown as number) * this.dupPercentRange;
      let val = getRandomFloat(this.start, this.end) as Result;

      for (let i = 0; i < this.tries + 1; i++) {
        if (
          this.lastVal === undefined ||
          this.lastVal === null ||
          val - (this.lastVal as unknown as number) > allowedRange
        ) {
          break;
        }

        val = getRandomFloat(this.start, this.end) as Result;
      }
      this.lastVal = val;

      return val;
    }

    if (this.start instanceof Point && this.end instanceof Point) {
      const allowedRange =
        (this.range as unknown as number) * this.dupPercentRange;
      let x = getRandomFloat(this.start.x, this.end.x);
      let y = getRandomFloat(this.start.y, this.end.y);

      for (let i = 0; i < this.tries + 1; i++) {
        if (
          this.lastVal === undefined ||
          this.lastVal === null ||
          (x - (this.lastVal as unknown as Point).x > allowedRange &&
            y - (this.lastVal as unknown as Point).y > allowedRange)
        ) {
          break;
        }

        x = getRandomFloat(this.start.x, this.end.x);
        y = getRandomFloat(this.start.y, this.end.y);
      }
      this.lastVal = (this.lastVal
        ? (this.lastVal as unknown as Point)
        : new Point()
      ).set(x, y) as unknown as S;

      return this.lastVal as Result;
    }

    throw new Error("Range type is not supported");
  }
}

export default RandomPick;
