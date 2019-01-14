import * as React from 'react'
import { Grid } from 'decentraland-ui'
import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import { Props } from './EditorPage.types'
import './EditorPage.css'

export default class EditorPage extends React.PureComponent<Props> {
  componentWillMount() {
    this.props.onLoadAssetPacks()
    this.props.onBindKeyboardShortcuts()
  }

  componentWillUnmount() {
    this.props.onUnbindKeyboardShortcuts()
  }

  render() {
    return (
      <div className="EditorPage">
        <TopBar />
        <Grid className="horizontal-layout">
          <Grid.Row>
            <ViewPort view="preview" />
            <SideBar />
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
