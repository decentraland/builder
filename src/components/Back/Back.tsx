import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { Back as BackComponent } from 'decentraland-ui'
import { Props } from './Back.types'

export default function Back(props: Props) {
  const { onClick, hasHistory, absolute, ...rest } = props
  const history = useHistory()
  const onBack = React.useCallback(() => {
    history.goBack()
  }, [history])
  return <BackComponent {...rest} onClick={hasHistory && !absolute ? onBack : onClick} />
}
