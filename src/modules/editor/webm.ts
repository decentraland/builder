export type Frame = {
  image: string // image/webp
  duration: number
  width: number
  height: number
  data: any
  riff: any
}

export type DataFrame = {
  data: any
  id: number
}

function toWebM(frames: Frame[]) {
  let info = checkFrames(frames)

  let CLUSTER_MAX_DURATION = 30000

  let EBML = [
    {
      id: 0x1a45dfa3, // EBML
      data: [
        {
          data: 1,
          id: 0x4286 // EBMLVersion
        },
        {
          data: 1,
          id: 0x42f7 // EBMLReadVersion
        },
        {
          data: 4,
          id: 0x42f2 // EBMLMaxIDLength
        },
        {
          data: 8,
          id: 0x42f3 // EBMLMaxSizeLength
        },
        {
          data: 'webm',
          id: 0x4282 // DocType
        },
        {
          data: 2,
          id: 0x4287 // DocTypeVersion
        },
        {
          data: 2,
          id: 0x4285 // DocTypeReadVersion
        }
      ]
    },
    {
      id: 0x18538067, // Segment
      data: [
        {
          id: 0x1549a966, // Info
          data: [
            {
              data: 1e6, // do things in millisecs (num of nanosecs for duration scale)
              id: 0x2ad7b1 // TimecodeScale
            },
            {
              data: 'whammy',
              id: 0x4d80 // MuxingApp
            },
            {
              data: 'whammy',
              id: 0x5741 // WritingApp
            },
            {
              data: doubleToString(info.duration),
              id: 0x4489 // Duration
            }
          ]
        },
        {
          id: 0x1654ae6b, // Tracks
          data: [
            {
              id: 0xae, // TrackEntry
              data: [
                {
                  data: 1,
                  id: 0xd7 // TrackNumber
                },
                {
                  data: 1,
                  id: 0x73c5 // TrackUID
                },
                {
                  data: 0,
                  id: 0x9c // FlagLacing
                },
                {
                  data: 'und',
                  id: 0x22b59c // Language
                },
                {
                  data: 'V_VP8',
                  id: 0x86 // CodecID
                },
                {
                  data: 'VP8',
                  id: 0x258688 // CodecName
                },
                {
                  data: 1,
                  id: 0x83 // TrackType
                },
                {
                  id: 0xe0, // Video
                  data: [
                    {
                      data: info.width,
                      id: 0xb0 // PixelWidth
                    },
                    {
                      data: info.height,
                      id: 0xba // PixelHeight
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 0x1c53bb6b, // Cues
          data: [
            // ncue insertion point
          ]
        }

        // cluster insertion point
      ]
    }
  ]

  let segment: DataFrame = EBML[1]
  let cues = segment.data[2]

  // Generate clusters (max duration)
  let frameNumber = 0
  let clusterTimecode = 0

  while (frameNumber < frames.length) {
    let cuePoint = {
      id: 0xbb, // CuePoint
      data: [
        {
          data: Math.round(clusterTimecode),
          id: 0xb3 // CueTime
        },
        {
          id: 0xb7, // CueTrackPositions
          data: [
            {
              data: 1,
              id: 0xf7 // CueTrack
            },
            {
              data: 0, // to be filled in when we know it
              size: 8,
              id: 0xf1 // CueClusterPosition
            }
          ]
        }
      ]
    }

    cues.data.push(cuePoint)

    let clusterFrames = []
    let clusterDuration = 0
    do {
      clusterFrames.push(frames[frameNumber])
      clusterDuration += frames[frameNumber].duration
      frameNumber++
    } while (frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION)

    let clusterCounter = 0
    let cluster: { id: number; data: DataFrame[] } = {
      id: 0x1f43b675, // Cluster
      data: [
        {
          data: Math.round(clusterTimecode).toString(),
          id: 0xe7 // Timecode
        }
      ].concat(
        clusterFrames.map(webp => {
          let block = makeSimpleBlock({
            discardable: 0,
            frame: webp.data.slice(4),
            invisible: 0,
            keyframe: 1,
            lacing: 0,
            trackNum: 1,
            timecode: Math.round(clusterCounter)
          })
          clusterCounter += webp.duration
          return {
            data: block,
            id: 0xa3
          }
        })
      )
    }

    segment.data.push(cluster)
    clusterTimecode += clusterDuration
  }

  let position = 0
  for (let i = 0; i < segment.data.length; i++) {
    if (i >= 3) {
      cues.data[i - 3].data[1].data[1].data = position
    }
    let data = generateEBML([segment.data[i]])
    position += data.size
    if (i !== 2) {
      segment.data[i] = data
    }
  }

  return generateEBML(EBML)
}

function checkFrames(frames: Frame[]) {
  let width = frames[0].width
  let height = frames[0].height
  let duration = frames[0].duration
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].width !== width) {
      throw new Error('Frame ' + (i + 1) + ' has a different width')
    }
    if (frames[i].height !== height) {
      throw new Error('Frame ' + (i + 1) + ' has a different height')
    }
    if (frames[i].duration < 0 || frames[i].duration > 0x7fff) {
      throw new Error('Frame ' + (i + 1) + ' has a weird duration (must be between 0 and 32767)')
    }
    duration += frames[i].duration
  }
  return {
    duration: duration,
    width: width,
    height: height
  }
}

function numToBuffer(num: number) {
  let parts = []
  while (num > 0) {
    parts.push(num & 0xff)
    num = num >> 8
  }
  return new Uint8Array(parts.reverse())
}

function numToFixedBuffer(num: number, size: number) {
  let parts = new Uint8Array(size)
  for (let i = size - 1; i >= 0; i--) {
    parts[i] = num & 0xff
    num = num >> 8
  }
  return parts
}

function strToBuffer(str: string) {
  let arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i)
  }
  return arr
}

function bitsToBuffer(bits: string) {
  let data = []
  let pad = bits.length % 8 ? new Array(1 + 8 - (bits.length % 8)).join('0') : ''
  bits = pad + bits
  for (let i = 0; i < bits.length; i += 8) {
    data.push(parseInt(bits.substr(i, 8), 2))
  }
  return new Uint8Array(data)
}

function generateEBML(json: any[]) {
  let ebml = []

  for (let i = 0; i < json.length; i++) {
    if (!('id' in json[i])) {
      // already encoded blob or byteArray
      ebml.push(json[i])
      continue
    }

    let data = json[i].data
    if (typeof data === 'object') data = generateEBML(data)
    if (typeof data === 'number') data = 'size' in json[i] ? numToFixedBuffer(data, json[i].size) : bitsToBuffer(data.toString(2))
    if (typeof data === 'string') data = strToBuffer(data)

    let len = data.size || data.byteLength || data.length
    let zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8)
    let sizeStr = len.toString(2)
    let padded = new Array(zeroes * 7 + 7 + 1 - sizeStr.length).join('0') + sizeStr
    let size = new Array(zeroes).join('0') + '1' + padded

    ebml.push(numToBuffer(json[i].id))
    ebml.push(bitsToBuffer(size))
    ebml.push(data)
  }

  return new Blob(ebml, { type: 'video/webm' })
}

function makeSimpleBlock(data: any) {
  let flags = 0
  if (data.keyframe) flags |= 128
  if (data.invisible) flags |= 8
  if (data.lacing) flags |= data.lacing << 1
  if (data.discardable) flags |= 1
  if (data.trackNum > 127) {
    throw new Error('TrackNumber > 127 not supported')
  }
  let out =
    [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags]
      .map(function(e) {
        return String.fromCharCode(e)
      })
      .join('') + data.frame

  return out
}

function parseWebP(riff: any) {
  let VP8 = riff.RIFF[0].WEBP[0]

  let frameStart = VP8.indexOf('\x9d\x01\x2a') // A VP8 keyframe starts with the 0x9d012a header

  let c = []
  for (let i = 0; i < 4; i++) {
    c[i] = VP8.charCodeAt(frameStart + 3 + i)
  }

  let width
  let height
  let tmp

  // the code below is literally copied verbatim from the bitstream spec
  tmp = (c[1] << 8) | c[0]
  width = tmp & 0x3fff
  tmp = (c[3] << 8) | c[2]
  height = tmp & 0x3fff

  return {
    width: width,
    height: height,
    data: VP8,
    riff: riff
  }
}

function parseRIFF(str: string) {
  let offset = 0
  let chunks: Record<any, any> = {}

  while (offset < str.length) {
    let id = str.substr(offset, 4)
    chunks[id] = chunks[id] || []
    if (id === 'RIFF' || id === 'LIST') {
      let len = parseInt(
        str
          .substr(offset + 4, 4)
          .split('')
          .map(function(i) {
            let unpadded = i.charCodeAt(0).toString(2)
            return new Array(8 - unpadded.length + 1).join('0') + unpadded
          })
          .join(''),
        2
      )
      let data = str.substr(offset + 4 + 4, len)
      offset += 4 + 4 + len
      chunks[id].push(parseRIFF(data))
    } else if (id === 'WEBP') {
      // Use (offset + 8) to skip past "VP8 "/"VP8L"/"VP8X" field after "WEBP"
      chunks[id].push(str.substr(offset + 8))
      offset = str.length
    } else {
      // Unknown chunk type; push entire payload
      chunks[id].push(str.substr(offset + 4))
      offset = str.length
    }
  }
  return chunks
}

function doubleToString(num: number) {
  return [].slice
    .call(
      new Uint8Array(
        new Float64Array([num]).buffer // create a float64 array
      ), // extract the array buffer
      0
    ) // convert the Uint8Array into a regular array
    .map(function(e) {
      // since it's a regular array, we can now use map
      return String.fromCharCode(e) // encode all the bytes individually
    })
    .reverse() // correct the byte endianness (assume it's little endian for now)
    .join('') // join the bytes in holy matrimony as a string
}

export class WebmEncoder {
  frames: Frame[] = []
  duration: number = 0
  quality: number = 0

  constructor(speed: number, quality: number = 0.8) {
    this.duration = 1000 / speed
    this.quality = quality
  }

  add(frame: string, duration: number = this.duration) {
    if (!/^data:image\/webp;base64,/gi.test(frame)) {
      throw new Error('Input must be formatted properly as a base64 encoded DataURI of type image/webp')
    }

    this.frames.push({
      image: frame,
      duration: duration,
      width: 0,
      height: 0,
      data: null,
      riff: null
    })
  }

  compile(callback: (blob: Blob) => any) {
    let webm = toWebM(
      this.frames.map(frame => {
        let webp: Partial<Frame> = parseWebP(parseRIFF(atob(frame.image.slice(23))))
        webp.duration = frame.duration
        webp.image = frame.image
        return webp as Frame
      })
    )
    callback(webm)
  }
}
