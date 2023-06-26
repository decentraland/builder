import { useState, useRef, useCallback } from 'react'
import classNames from 'classnames'
import { Badge } from 'decentraland-ui'
import { Props } from './SceneCard.types'
import styles from './SceneCard.module.css'

const PUBLIC_URL = process.env.PUBLIC_URL

export const SceneCard: React.FC<Props> = ({ title, subtitle, description, videoSrc, imgSrc, disabled, tag, onClick }) => {
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

  return (
    <button
      className={styles.container}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      aria-label={title}
    >
      <div className={styles.media}>
        {videoSrc && (
          <video
            className={classNames(styles.thumbnail, { [styles.hidden]: !hovered })}
            src={`${PUBLIC_URL}${videoSrc}`}
            muted
            ref={video}
          />
        )}
        <img
          className={classNames(styles.thumbnail, { [styles.hidden]: !!hovered && videoSrc })}
          alt={title}
          src={`${PUBLIC_URL}${imgSrc}`}
        />
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.description}>
          <div className={styles.descriptionInfo}>
            <span className={styles.title}>{title}</span>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
          {tag ? (
            <Badge className={styles.badge} color={tag.color}>
              {tag.label}
            </Badge>
          ) : null}
        </div>
        {hovered && <span className={styles.info}>{description}</span>}
      </div>
    </button>
  )
}
