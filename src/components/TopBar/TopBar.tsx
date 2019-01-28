import * as React from 'react'
import { Link } from 'react-router-dom'
import { Header, Grid, Icon } from 'decentraland-ui'

import { locations } from 'routing/locations'
import { Props } from './TopBar.types'
import './TopBar.css'

export default class TopBar extends React.PureComponent<Props> {
  render() {
    const { currentProject } = this.props
    return (
      <Grid className="TopBar">
        <Grid.Column verticalAlign="middle">
          <Header size="medium">
            <Link className="text" to={locations.root()}>
              <Icon name="chevron left" />
            </Link>
            {currentProject ? currentProject.title : null}
          </Header>
        </Grid.Column>
      </Grid>
    )
  }
}
