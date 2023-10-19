import { StringOrObject } from '../types/index.types';

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export function stringifyData(data: StringOrObject) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
function capitalize(s: string): Capitalize<string> {
  if (s.length === 0) return '';

  return (s[0].toUpperCase() + s.slice(1)) as Capitalize<string>;
}
function singleSnakeToCamel(string: string): string {
  const [start, ...rest] = string.split('_');

  return start + rest.map(capitalize).join('');
}

export function snakeToCamel<T extends object>(object: T): T {
  return Object.entries(object).reduce(
    (result, [key, value]) => ({
      ...result,
      [singleSnakeToCamel(key)]:
        typeof value === 'object' ? snakeToCamel(value) : value,
    }),
    {}
  ) as T;
}
