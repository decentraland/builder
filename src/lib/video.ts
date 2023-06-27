import { useCallback, useRef, useState } from 'react'

export function usePlayVideoOnHover() {
  const [hovered, setHovered] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

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
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}
