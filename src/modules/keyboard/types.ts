export type KeyboardShortcut = BaseKeyboardShortcut & {
  callback: (event: ExtendedKeyboardEvent, combination: string) => boolean | void
}

export type BaseKeyboardShortcut = {
  combination: string | string[]
  action?: 'keydown' | 'keyup'
}
