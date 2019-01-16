export type KeyboardShortcut = BaseKeyboardShortcut & {
  callback: (event: ExtendedKeyboardEvent, combination: string) => any
}

export type BaseKeyboardShortcut = {
  combination: string | string[]
  action?: 'keydown' | 'keyup'
}
