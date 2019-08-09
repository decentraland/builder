// Pseudo Set and Map helpers. They exist because we are storing them in LS
// and they get converted to regular objects and arrays

export function addElement(set: string[], element: string) {
  return [...removeElement(set, element), element]
}

export function removeElement(set: string[], element: string) {
  return set.filter(x => x !== element)
}

export function addEntry(map: Record<string, string>, id: string, element: string) {
  return {
    ...map,
    [id]: element
  }
}

export function removeEntry(map: Record<string, string>, id: string) {
  const newMap = { ...map }
  delete newMap[id]
  return newMap
}
