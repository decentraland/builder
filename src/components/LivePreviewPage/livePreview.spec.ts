import { blobsAreEqual, buildStateUrl, isSameModelMetadata } from './livePreview'

jest.mock('decentraland-dapps/dist/modules/translation/utils', () => ({ t: (key: string) => key }))

describe('when building the state URL', () => {
  it('should hit /state with no query before a version is known', () => {
    expect(buildStateUrl('http://127.0.0.1:8080', null)).toBe('http://127.0.0.1:8080/state')
    expect(buildStateUrl('http://127.0.0.1:8080/')).toBe('http://127.0.0.1:8080/state')
  })

  it('should long-poll with the last seen version once there is one', () => {
    expect(buildStateUrl('http://127.0.0.1:8080', 7)).toBe('http://127.0.0.1:8080/state?since=7')
    expect(buildStateUrl('http://127.0.0.1:8080', 'a b')).toBe('http://127.0.0.1:8080/state?since=a%20b')
  })
})

describe('when comparing model metadata', () => {
  it('should ignore the version counter', () => {
    expect(isSameModelMetadata({ version: 1, type: 'emote', name: 'Wave' }, { version: 2, type: 'emote', name: 'Wave' })).toBe(true)
  })

  it('should detect a category change', () => {
    expect(isSameModelMetadata({ version: 1, type: 'wearable', category: 'hat' }, { version: 2, type: 'wearable', category: 'mask' })).toBe(
      false
    )
  })

  it('should treat a missing previous state as different', () => {
    expect(isSameModelMetadata(null, { version: 1 })).toBe(false)
  })
})

describe('when comparing blobs', () => {
  // jsdom's Blob has no arrayBuffer(); give it one so the byte comparison can run.
  const withBuffer = (bytes: number[]) => {
    const blob = new Blob([new Uint8Array(bytes)])
    const arrayBuffer = jest.fn(() => Promise.resolve(new Uint8Array(bytes).buffer))
    Object.defineProperty(blob, 'arrayBuffer', { value: arrayBuffer, configurable: true })
    return { blob, arrayBuffer }
  }

  it('should be equal for the same bytes', async () => {
    expect(await blobsAreEqual(withBuffer([1, 2, 3]).blob, withBuffer([1, 2, 3]).blob)).toBe(true)
  })

  it('should differ on size without reading the contents', async () => {
    const a = withBuffer([1, 2, 3])
    const b = withBuffer([1, 2])
    expect(await blobsAreEqual(a.blob, b.blob)).toBe(false)
    expect(a.arrayBuffer).not.toHaveBeenCalled()
  })

  it('should differ on content', async () => {
    expect(await blobsAreEqual(withBuffer([1, 2, 3]).blob, withBuffer([1, 2, 4]).blob)).toBe(false)
  })
})
