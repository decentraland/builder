import * as React from 'react'
import { Header, Grid } from 'decentraland-ui'
import './TopBar.css'

export default class TopBar extends React.Component {
  render() {
    return (
      <Grid className="TopBar">
        <Grid.Column verticalAlign="middle">
          <Header size="medium">Land title</Header>
        </Grid.Column>
      </Grid>
    )
  }
}
