import { ignoreSceneDisposed, isSceneDisposedError } from './wearablePreview'

const sceneDisposedError = new Error('The scene was disposed, a newer render has replaced it')

describe('when checking whether an error comes from a superseded wearable preview render', () => {
  it('should match the error the preview rejects with once its scene was disposed', () => {
    expect(isSceneDisposedError(sceneDisposedError)).toBe(true)
  })

  it('should not match any other error', () => {
    expect(isSceneDisposedError(new Error('Request timeout for getScreenshot'))).toBe(false)
    expect(isSceneDisposedError('The scene was disposed, a newer render has replaced it')).toBe(false)
  })
})

describe('when settling a wearable preview call nobody awaits', () => {
  describe('and the call succeeds', () => {
    it('should resolve with its value', async () => {
      await expect(ignoreSceneDisposed(Promise.resolve(42))).resolves.toBe(42)
    })
  })

  describe('and the render was superseded', () => {
    it('should resolve without a value instead of rejecting', async () => {
      await expect(ignoreSceneDisposed(Promise.reject(sceneDisposedError))).resolves.toBeUndefined()
    })
  })

  describe('and the call fails for any other reason', () => {
    it('should reject with the same error', async () => {
      const failure = new Error('Request timeout for getScreenshot')

      await expect(ignoreSceneDisposed(Promise.reject(failure))).rejects.toBe(failure)
    })
  })

  describe('and there is no controller to call', () => {
    it('should resolve without a value', async () => {
      await expect(ignoreSceneDisposed(undefined)).resolves.toBeUndefined()
    })
  })
})
