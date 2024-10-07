import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation'
import styles from './ThirdPartyKindBadge.module.css'

export const ThirdPartyKindBadge = ({ isProgrammatic, className }: { isProgrammatic?: boolean; className?: string }) => (
  <div className={classNames(styles.badge, isProgrammatic ? styles.programmatic : styles.standard, className)}>
    {isProgrammatic ? t('third_party_kind_badge.programmatic') : t('third_party_kind_badge.standard')}
  </div>
)
