import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Icon, Loader, Popup } from 'decentraland-ui'
import { Props } from './SDKTag.types'
import styles from './SDKTag.module.css'

export default function SDKTag({ scene }: Props) {
  if (!scene) {
    return (
      <span className={styles.container}>
        <Loader active size="mini" className={styles.loader} />
      </span>
    )
  }

  if (scene.sdk6) {
    return (
      <Popup
        content={t('scenes_page.sdk6_support')}
        trigger={
          <span className={styles.container}>
            <Icon name="exclamation triangle" />
            SDK 6
          </span>
        }
      />
    )
  }

  return <span className={styles.container}>SDK 7</span>
}
