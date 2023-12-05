export function getRandomFloat(min: number, max: number): number;
export function getRandomFloat(max: number): number;
export function getRandomFloat(minOrMax: number, maybeMax?: number): number {
  let [min, max] =
    maybeMax === undefined ? [0, minOrMax] : [minOrMax, maybeMax];
  let result = Math.random() * (max - min) + min;

  if (min < 0) {
    if (max < 0) {
      min = Math.abs(min);
      result = Math.random() * (min + max) - min;
    }
  } else {
    if (max > 0) {
      min = min * -1;
      result = Math.random() * (min + max) - min;
    }
  }

  return result;
}

export function getRandomInt(min: number, max: number): number;
export function getRandomInt(max: number): number;
export function getRandomInt(minOrMax: number, maybeMax?: number) {
  let [min, max] =
    maybeMax === undefined ? [0, minOrMax] : [minOrMax, maybeMax];

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomBool() {
  return Math.random() >= 0.5;
}

export function getRandomChoose<T>(arr: T[]) {
  return arr[getRandomInt(arr.length - 1)];
}

export interface DuplicationReducedRandomHitRecord {
  [key: number]: number;
}

export interface DuplicationReducedRandomConfig {
  // For each last hit, reduce the chance of accepting the number by this percentage
  duplicateAcceptPercentage: number;
  maxTries: number;
}

export function getDuplicationReducedRandomInt(
  min: number,
  max: number,
  hitRecord: DuplicationReducedRandomHitRecord,
  config: DuplicationReducedRandomConfig = {
    duplicateAcceptPercentage: 0.5,
    maxTries: 20,
  }
) {
  let randomInt = getRandomInt(min, max);
  for (let i = 0; i < config.maxTries; i++) {
    const lastHits = hitRecord[randomInt] || 0;

    if (Math.random() < Math.pow(config.duplicateAcceptPercentage, lastHits)) {
      break;
    }

    randomInt = getRandomInt(min, max);
  }

  hitRecord[randomInt] = (hitRecord[randomInt] || 0) + 1;
  return randomInt;
}

export function getDuplicationReducedRandomChoose<T>(
  arr: T[],
  hitRecord: DuplicationReducedRandomHitRecord,
  config: DuplicationReducedRandomConfig = {
    duplicateAcceptPercentage: 0.5,
    maxTries: 20,
  }
) {
  return arr[
    getDuplicationReducedRandomInt(0, arr.length - 1, hitRecord, config)
  ];
}
