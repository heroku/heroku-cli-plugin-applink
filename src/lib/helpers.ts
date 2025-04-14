const toTitleCase = (str: string) => str.replace(
  /\w\S*/g,
  text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
)

export function humanize(value?: string | null): string {
  return toTitleCase((value || '').replace('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2'))
}

export function humanizeKeys(params: {[key: string]: string | null}): {[key: string]: string} {
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value).map(
    ([key, value]) => [humanize(key), value as string]
  ))
}

export function * arraySlice<T>(array: T[], size = 10): Generator<T[], void> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size)
  }
}
