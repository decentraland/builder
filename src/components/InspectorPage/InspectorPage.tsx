/* eslint-disable no-debugger */
import * as React from 'react'
import { Center, Loader } from 'decentraland-ui'

import { Props } from './InspectorPage.types'
import './InspectorPage.css'
import { toComposite } from 'modules/inspector/utils'

export default class InspectorPage extends React.PureComponent<Props> {
  componentDidMount() {
    const { onOpen } = this.props
    onOpen()
  }

  render() {
    const { scene, isLoggedIn } = this.props

    if (!isLoggedIn) {
      return (
        <div className="InspectorPager">
          <Center>Sign In</Center>
        </div>
      )
    }

    return <div className="InspectorPager">{!scene ? <Loader active /> : <p>{JSON.stringify(toComposite(scene))}</p>}</div>
  }
}
