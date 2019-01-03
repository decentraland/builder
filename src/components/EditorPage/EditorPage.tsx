import * as React from 'react'
import TopBar from 'components/TopBar'
import ViewPort from 'components/ViewPort'
import SideBar from 'components/SideBar'
import { Grid } from 'decentraland-ui'
import './EditorPage.css'

export default class EditorPage extends React.Component {
  render() {
    return (
      <div className="EditorPage">
        <TopBar />
        <Grid className="horizontal-layout" >
          <Grid.Row>
            <ViewPort view="preview" />
            <SideBar />
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}
