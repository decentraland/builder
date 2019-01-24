import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon } from 'decentraland-ui'

import { locations } from 'routing/locations'
import './TopBar.css'

export default class TopBar extends React.PureComponent {
  render() {
    return (
      <Grid className="TopBar">
        <Grid.Column verticalAlign="middle">
          <Header size="medium">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            LAND title
          </Header>
        </Grid.Column>
      </Grid>
    )
  }
}
