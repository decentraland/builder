import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { Back as BackComponent, BackProps } from 'decentraland-ui'
import styles from './Back.module.css'

export default function Back(props: BackProps) {
  const { onClick, absolute, ...rest } = props
  const history = useHistory()
  const onBack = React.useCallback(() => {
    history.goBack()
  }, [history])
  return <BackComponent {...rest} className={styles.main} onClick={history.length && !absolute ? onBack : onClick} />
}
