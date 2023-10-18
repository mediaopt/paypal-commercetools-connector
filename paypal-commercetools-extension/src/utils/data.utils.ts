import { StringOrObject } from '../types/index.types';

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export function stringifyData(data: StringOrObject) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
function capitalize<S extends string>(string: S): Capitalize<S> {
  if (string.length === 0) return '' as never;

  return (string[0].toUpperCase() + string.slice(1)) as never;
}
function singleSnakeToCamel(string: string): string {
  const [start, ...rest] = string.split('_');

  return (start + rest.map(capitalize).join('')) as never;
}

export function snakeToCamel<T extends object>(
  object: T
): T {
  return Object.entries(object).reduce(
    (result, [key, value]) => ({
      ...result,
      [singleSnakeToCamel(key)]:
        typeof value === 'object' ? snakeToCamel(value) : value,
    }),
    {}
  ) as never;
}
