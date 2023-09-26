import { StringOrObject } from '../types/index.types';

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export function stringifyData(data: StringOrObject) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
