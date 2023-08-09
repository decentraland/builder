import { useCallback, useEffect, useRef, useState } from 'react'
import { getFileSize } from './file'

export function useVideo() {
  const [hovered, setHovered] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [size, setSize] = useState(0)
  const [duration, setDuration] = useState(0)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = video.current

    const loadVideoHandler = async () => {
      const fileSize = await getFileSize((videoElement as HTMLVideoElement).src)
      setSize(fileSize)
      setDuration((videoElement as HTMLVideoElement).duration)
      setLoading(false)
    }

    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', loadVideoHandler)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', loadVideoHandler)
      }
    }
  }, [])

  const isVideoPlaying = () => {
    return (
      video.current &&
      video.current.currentTime > 0 &&
      !video.current.paused &&
      !video.current.ended &&
      video.current.readyState > video.current.HAVE_CURRENT_DATA
    )
  }

  const handleMouseEnter = useCallback(async () => {
    setHovered(true)
    if (video.current && !isVideoPlaying()) {
      await video.current.play()
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    if (video.current && isVideoPlaying()) {
      video.current.pause()
      video.current.currentTime = 0
    }
  }, [])

  return {
    hovered,
    video,
    size,
    duration,
    isLoading,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}
