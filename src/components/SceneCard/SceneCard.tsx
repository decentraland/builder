import classNames from 'classnames'
import { useVideo } from 'lib/video'
import { Badge } from 'decentraland-ui'
import { Props } from './SceneCard.types'
import styles from './SceneCard.module.css'

export const SceneCard: React.FC<Props> = ({ title, subtitle, description, videoSrc, imgSrc, disabled, tag, onClick }) => {
  const { video, hovered, onMouseEnter, onMouseLeave } = useVideo()

  return (
    <button
      className={styles.container}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      aria-label={title}
    >
      <div className={styles.media}>
        {videoSrc && <video className={classNames(styles.thumbnail, { [styles.hidden]: !hovered })} src={videoSrc} muted ref={video} />}
        <img className={classNames(styles.thumbnail, { [styles.hidden]: !!hovered && videoSrc })} alt={title} src={imgSrc} />
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
