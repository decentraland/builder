/**
 * The message @dcl/wearable-preview rejects a controller call with once a re-render (an options update, a new
 * upload) has disposed the scene that controller belonged to. It fails fast on purpose so the caller can retry
 * against the new controller, and the newer render fires its own `onLoad`/`onUpdate`, so there is nothing
 * left to do for the superseded call.
 */
const SCENE_DISPOSED_MESSAGE = 'The scene was disposed, a newer render has replaced it'

export function isSceneDisposedError(error: unknown): boolean {
  return error instanceof Error && error.message === SCENE_DISPOSED_MESSAGE
}

/**
 * Settles a wearable preview controller call that nobody awaits, dropping only the rejection of a render that
 * has been superseded. Any other failure is rethrown, so it still surfaces exactly as before.
 */
export function ignoreSceneDisposed<T>(promise: Promise<T> | undefined): Promise<T | undefined> {
  if (!promise) return Promise.resolve(undefined)

  return promise.catch((error: unknown) => {
    if (isSceneDisposedError(error)) return undefined
    throw error
  })
}
