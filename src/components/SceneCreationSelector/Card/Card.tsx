import { useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import { Props } from './Card.types'
import styles from './Card.module.css'

export function Card({ title, description, videoSrc, imgSrc, onClick }: Props) {
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

  return (
    <div className={styles.container} role="button" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}>
      <div className={styles.media}>
        <video className={classNames(styles.thumbnail, { [styles.hidden]: !hovered })} src={videoSrc} muted ref={video} />
        <img className={classNames(styles.thumbnail, { [styles.hidden]: !!hovered })} alt={title} src={imgSrc} />
      </div>
      <div className={styles.description}>
        <span className={styles.title}>{title}</span>
        {hovered && <span className={styles.info}>{description}</span>}
      </div>
    </div>
  )
}
