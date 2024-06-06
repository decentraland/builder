import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { Back as BackComponent } from 'decentraland-ui'
import { Props } from './Back.types'

export default class Back extends React.PureComponent<Props> {
  render() {
    const { onClick, hasHistory, absolute, ...rest } = this.props
    const history = useHistory()
    const onBack = React.useCallback(() => {
      history.goBack()
    }, [history])
    return <BackComponent {...rest} onClick={hasHistory && !absolute ? onBack : onClick} />
  }
}
