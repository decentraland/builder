import { Blockie } from 'decentraland-ui'
import classNames from 'classnames'
import styles from './ThirdPartyImage.module.css'
import { Props } from './ThirdPartyImage.types'

export const ThirdPartyImage = (props: Props) => {
  const { thirdPartyId, className, shape } = props
  return <Blockie className={classNames(styles.main, className)} seed={thirdPartyId} size={8} scale={8} shape={shape ?? 'circle'} />
}
