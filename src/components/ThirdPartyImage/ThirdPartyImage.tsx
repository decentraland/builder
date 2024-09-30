import { Blockie } from 'decentraland-ui'
import classNames from 'classnames'
import { NetworkIcon } from 'components/NetworkIcon'
import CollectionImage from 'components/CollectionImage'
import styles from './ThirdPartyImage.module.css'
import { Props } from './ThirdPartyImage.types'

export const ThirdPartyImage = (props: Props) => {
  const { collection, collectionId, className, shape } = props

  return (
    <div className={classNames(styles.main, className)}>
      {collection?.itemCount ? (
        <CollectionImage collectionId={collectionId} className={styles.image} />
      ) : (
        <Blockie className={styles.image} seed={collectionId} size={8} scale={8} shape={shape ?? 'circle'} />
      )}
      {collection?.linkedContractNetwork ? <NetworkIcon network={collection?.linkedContractNetwork} className={styles.network} /> : null}
    </div>
  )
}
