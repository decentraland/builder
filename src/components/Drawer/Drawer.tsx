import * as React from 'react'
import { Grid } from 'decentraland-ui'
import { Props, State } from './Drawer.types'
import './Drawer.css'

export default class Drawer extends React.PureComponent<Props, State> {
  state = {
    isOpen: false
  }

  render() {
    const { label, children } = this.props
    const { isOpen } = this.state

    return (
      <Grid className="Drawer">
        <Grid.Column>{label}</Grid.Column>
        <Grid.Column>></Grid.Column>
        {isOpen ? children : null}
      </Grid>
    )
  }
}
