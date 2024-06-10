import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { Back as BackComponent, BackProps } from 'decentraland-ui'

export default function Back(props: BackProps) {
  const { onClick, absolute, ...rest } = props
  const history = useHistory()
  const onBack = React.useCallback(() => {
    history.goBack()
  }, [history])
  return <BackComponent {...rest} onClick={history.length && !absolute ? onBack : onClick} />
}
