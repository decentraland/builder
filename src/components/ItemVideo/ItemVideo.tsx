import React from 'react'
import classNames from 'classnames'
import { getVideoURL } from 'modules/item/utils'
import VideoMetrics from './VideoMetrics'
import { Props } from './ItemVideo.types'
import './ItemVideo.css'
import { useVideo } from 'lib/video'

const ItemVideo: React.FC<Props> = ({ className, item, src, showMetrics = false, previewIcon = null, children = undefined }: Props) => {
  const { video, duration, size, isLoading } = useVideo()
  const videoSrc = src || (item ? getVideoURL(item) : '')

  return (
    <div className={classNames('ItemVideoContainer', className)}>
      <div className="ItemVideo is-video video-wrapper">
        <video className="item-video" preload="auto" src={videoSrc} ref={video} />
        {previewIcon ?? null}
      </div>
      {children ? children(video, duration, size, isLoading) : null}
      {showMetrics && !isLoading ? <VideoMetrics className="ItemVideoMetricsContainer" duration={duration} size={size} /> : null}
    </div>
  )
}

export default React.memo(ItemVideo)
