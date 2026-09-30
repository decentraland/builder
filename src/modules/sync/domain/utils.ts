export function addElement(set: string[], element: string) {
  return [...removeElement(set, element), element]
}

export function removeElement(set: string[], element: string) {
  return set.filter(x => x !== element)
}
