import React from 'react'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getVideoURL, hasVideo } from 'modules/item/utils'
import { useVideo } from 'lib/video'
import VideoMetrics from './VideoMetrics'
import { Props } from './ItemVideo.types'
import './ItemVideo.css'

const ItemVideo: React.FC<Props> = ({
  className,
  item,
  src,
  showMetrics = false,
  previewIcon = null,
  children = undefined,
  onClick = undefined
}: Props) => {
  const { video, duration, size, isLoading } = useVideo()
  const videoSrc = src || (item ? getVideoURL(item) : '')

  return (
    <div className={classNames('ItemVideoContainer', className)}>
      {hasVideo(item, src) ? (
        <>
          <div className={classNames('ItemVideo', 'is-video', 'video-wrapper')} onClick={onClick}>
            <video className="item-video" preload="auto" src={videoSrc} ref={video} />
            {previewIcon ?? null}
          </div>
          {children ? children(video, duration, size, isLoading) : null}
          {showMetrics && !isLoading ? <VideoMetrics className="ItemVideoMetricsContainer" duration={duration} size={size} /> : null}
        </>
      ) : (
        <div className="ItemEmptyVideoContainer" onClick={onClick}>
          <div className="empty-video-icon" />
          <div className="empty-video-text">{t('create_single_item_modal.upload_video_step_title')}</div>
        </div>
      )}
    </div>
  )
}

export default React.memo(ItemVideo)
