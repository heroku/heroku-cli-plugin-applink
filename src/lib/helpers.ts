const toTitleCase = (str: string) =>
  str.replaceAll(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
  );

export function humanize(value?: null | string): string {
  return toTitleCase((value || '').replace('_', ' ').replaceAll(/([a-z])([A-Z])/g, '$1 $2'));
}

export function humanizeKeys(params: {[key: string]: null | string}): {
  [key: string]: string;
} {
  return Object.fromEntries(Object.entries(params)
    .filter(([_, value]) => value)
    .map(([key, value]) => [humanize(key), value as string]));
}
