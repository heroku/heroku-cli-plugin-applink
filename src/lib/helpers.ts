const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  )
}

export function humanize(underscored: string): string {
  return toTitleCase(underscored.replace('_', ' '))
}

export function humanizeKeys(params: {[key: string]: string | null}): {[key: string]: string} {
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value).map(
    ([key, value]) => [humanize(key), value as string]
  ))
}
