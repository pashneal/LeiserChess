export function consecutivePairsOf<T>(array: T[]): [T | null, T | null ][] {
  let pairs : [T | null, T | null][];
  pairs = array.slice(0, array.length - 1)
               .map((_, index) => [array[index]!, array[index + 1]!]);
  if (array.length % 2 === 1) {
    pairs.push([array[array.length - 1]!, null])
  }
  return pairs;
}

export function everyOther<T>(array: T[]): T[] {
  return array.filter((_, index) => index % 2 === 0);
}

export function last<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot get the last element of an empty array");
  }
  return array[array.length - 1]!;
}

