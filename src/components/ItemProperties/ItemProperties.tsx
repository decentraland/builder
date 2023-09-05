import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { areEmoteMetrics } from 'modules/models/types'
import { Props } from './ItemProperties.types'
import styles from './ItemProperties.module.css'

export default function ItemProperties({ item }: Props) {
  const { metrics } = item
  const hasSound = Object.keys(item.contents).some(contentKey => contentKey.endsWith('mp3') || contentKey.endsWith('ogg'))

  return areEmoteMetrics(metrics) ? (
    <div className={styles.metrics}>
      <div className={classNames(styles.itemMetric, styles.sequences)}>{t('model_metrics.sequences', { count: metrics.sequences })}</div>
      <div className={classNames(styles.itemMetric, styles.duration)}>
        {t('model_metrics.duration', { count: Number(metrics.duration.toFixed(2)) })}
      </div>
      <div className={classNames(styles.itemMetric, styles.frames)}>{t('model_metrics.frames', { count: metrics.frames })}</div>
      <div className={classNames(styles.itemMetric, styles.fps)}>{t('model_metrics.fps', { count: Number(metrics.fps.toFixed(2)) })}</div>
      {hasSound && <div className={classNames(styles.itemMetric, styles.sound)}>{t('model_metrics.sound')}</div>}
    </div>
  ) : (
    <div className={styles.metrics}>
      <div className={classNames(styles.itemMetric, styles.triangles)}>{t('model_metrics.triangles', { count: metrics.triangles })}</div>
      <div className={classNames(styles.itemMetric, styles.materials)}>{t('model_metrics.materials', { count: metrics.materials })}</div>
      <div className={classNames(styles.itemMetric, styles.textures)}>{t('model_metrics.textures', { count: metrics.textures })}</div>
    </div>
  )
}
