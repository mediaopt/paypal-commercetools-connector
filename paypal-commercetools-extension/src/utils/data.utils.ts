export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export function stringifyData(data: string | object) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}
