const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  )
}

export function humanizeKeys(params: {[key: string]: string | null}): {[key: string]: string} {
  return Object.fromEntries(Object.entries(params).filter(([_, value]) => value).map(
    ([key, value]) => [toTitleCase(key.replace('_', ' ')), value as string]
  ))
}
