import * as React from 'react'
import { Grid } from 'decentraland-ui'

import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import Metrics from 'components/Metrics'
import { Props } from './EditorPage.types'
import './EditorPage.css'

export default class EditorPage extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.onStartEditor()
    this.props.onLoadAssetPacks()
    this.props.onBindKeyboardShortcuts()
  }

  componentWillUnmount() {
    this.props.onUnbindKeyboardShortcuts()
    this.props.onCloseEditor()
  }

  render() {
    const { isPreviewing, isSidebarOpen } = this.props
    const className = isPreviewing ? 'fullscreen' : 'horizontal-layout'
    return (
      <div className="EditorPage">
        {isPreviewing ? null : <TopBar />}
        <Grid className={className}>
          <Grid.Row>
            <ViewPort />
            {isPreviewing || !isSidebarOpen ? null : <SideBar />}
            {isPreviewing ? null : <Metrics />}
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
