import { Blockie } from 'decentraland-ui'
import classNames from 'classnames'
import { NetworkIcon } from 'components/NetworkIcon'
import styles from './ThirdPartyImage.module.css'
import { Props } from './ThirdPartyImage.types'

export const ThirdPartyImage = (props: Props) => {
  const { thirdPartyId, network, className, shape } = props
  return (
    <div className={classNames(styles.main, className)}>
      <Blockie className={styles.image} seed={thirdPartyId} size={8} scale={8} shape={shape ?? 'circle'} />
      {network ? <NetworkIcon network={network} className={styles.network} /> : null}
    </div>
  )
}
