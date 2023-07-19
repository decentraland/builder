import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getVideoURL } from 'modules/item/utils'
import { getFileSize, toMB } from 'lib/file'
import { Props } from './ItemVideo.types'
import './ItemVideo.css'

const ItemVideo: React.FC<Props> = ({ className, item, src, showMetrics = false }: Props) => {
  const [isLoadedVideo, setLoadedVideo] = useState<boolean>(false)
  const [videoSize, setVideoSize] = useState<number>(0)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const video = useRef<HTMLVideoElement>(null)
  const videoSrc = src || getVideoURL(item)

  useEffect(() => {
    const videoElement = video.current

    const loadVideoHandler = async () => {
      const fileSize = await getFileSize(videoSrc)
      setVideoSize(fileSize)
      setVideoDuration(videoElement?.duration || 0)
      setLoadedVideo(true)
    }

    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', loadVideoHandler)
    }

    return () => {
      if (videoElement) {
        setVideoDuration(0)
        setVideoSize(0)
        videoElement.removeEventListener('loadedmetadata', loadVideoHandler)
      }
    }
  }, [videoSrc])

  return (
    <div className={classNames('ItemVideoContainer', className)}>
      <div className="ItemVideo is-video video-wrapper">
        <video className="item-video" preload="auto" src={videoSrc} ref={video} />
      </div>
      {showMetrics && isLoadedVideo ? (
        <div className="metrics">
          <div className="metric">
            <Icon name="clock outline" />
            {t('video_stats.seconds', { seconds: videoDuration.toFixed(2) })}
          </div>
          <div className="metric">
            <Icon name="video" />
            {t('video_stats.size', { size: toMB(videoSize).toFixed(2) })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default React.memo(ItemVideo)
