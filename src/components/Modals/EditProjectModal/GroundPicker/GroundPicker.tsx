import * as React from 'react'
import { Grid } from 'decentraland-ui'

import { Asset } from 'modules/asset/types'
import { Props, State } from './GroundPicker.types'
import GroundCard from './GroundCard/GroundCard'
import './GroundPicker.css'

const DEFAULT_COLUMN_COUNT = 5

export default class GroundPicker extends React.PureComponent<Props, State> {
  static defaultProps = {
    columnCount: DEFAULT_COLUMN_COUNT,
    grounds: []
  }

  handleClick = (id: string) => {
    this.props.onClick(id)
  }

  renderGrid(grounds: Asset[]) {
    const columnCount = this.getColumnCount()
    const { selectedGround } = this.props
    let el = []

    for (let i = 0; i < grounds.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        const asset = grounds[j]
        if (!asset) break

        row.push(
          <Grid.Column key={`ground-${i}-${j}`}>
            <GroundCard
              name={asset.name}
              thumbnail={asset.thumbnail}
              isActive={selectedGround === asset.name}
              onClick={() => this.handleClick(asset.id)}
            />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row key={i}>{row}</Grid.Row>)
    }

    return el
  }

  getColumnCount(): number {
    return Number(this.props.columnCount)
  }

  render() {
    const { columnCount, grounds } = this.props

    return (
      <div className="GroundPicker">
        <Grid columns={columnCount} padded="horizontally" className={`ground-grid`}>
          {this.renderGrid(Object.values(grounds))}
        </Grid>
      </div>
    )
  }
}
