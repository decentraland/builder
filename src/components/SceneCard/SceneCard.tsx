import { useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import { Props } from './SceneCard.types'
import styles from './SceneCard.module.css'

export function SceneCard({ title, subtitle, description, videoSrc, imgSrc, disabled, onClick }: Props) {
  const [hovered, setHovered] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = useCallback(async () => {
    setHovered(true)
    if (video.current) {
      await video.current.play()
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    if (video.current) {
      video.current.pause()
      video.current.currentTime = 0
    }
  }, [])

  console.log(title)
  return (
    <button
      className={styles.container}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className={styles.media}>
        {videoSrc && <video className={classNames(styles.thumbnail, { [styles.hidden]: !hovered })} src={videoSrc} muted ref={video} />}
        <img className={classNames(styles.thumbnail, { [styles.hidden]: !!hovered && videoSrc })} alt={title} src={imgSrc} />
      </div>
      <div className={styles.description}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        {hovered && <span className={styles.info}>{description}</span>}
      </div>
    </button>
  )
}
