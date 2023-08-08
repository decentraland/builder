import React from 'react'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Icon } from 'decentraland-ui'
import { toMB } from 'lib/file'

type Props = {
  size: number
  duration: number
  className?: string
  showIcons?: boolean
}

const VideoMetrics: React.FC<Props> = ({ size, duration, className, showIcons = true }: Props) => {
  return (
    <div className={classNames('VideoMetrics', className)}>
      <div className="metric">
        {showIcons && <Icon name="clock outline" />}
        {t('video_stats.seconds', { seconds: duration.toFixed(2) })}
      </div>
      <div className="metric">
        {showIcons && <Icon name="video" />}
        {t('video_stats.size', { size: toMB(size).toFixed(2) })}
      </div>
    </div>
  )
}

export default React.memo(VideoMetrics)
