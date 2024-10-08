import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation'
import styles from './CollectionTypeBadge.module.css'

export const CollectionTypeBadge = ({ isThirdParty, className }: { isThirdParty?: boolean; className?: string }) => (
  <div className={classNames(styles.badge, isThirdParty ? styles.thirdParty : styles.regular, className)}>
    {isThirdParty ? t('collection_type_badge.third_party') : t('collection_type_badge.regular')}
  </div>
)
