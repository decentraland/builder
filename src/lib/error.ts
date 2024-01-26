export function isErrorWithCode(error: unknown): error is { code: number } {
  return error !== undefined && error !== null && typeof error === 'object' && 'code' in error
}

export function isErrorWithTitle(error: unknown): error is { title: string } {
  return error !== undefined && error !== null && typeof error === 'object' && 'title' in error
}
