import * as React from 'react'

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

  handleClick = (id: string | null) => {
    this.props.onClick(id)
  }

  renderGrid(grounds: Array<Asset | null>) {
    const columnCount = this.getColumnCount()
    const { selectedGround } = this.props
    let el = []

    for (let i = 0; i < grounds.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        if (i === 0 && j === 0) {
          row.push(
            <div key={`ground-${i}-${j}`} className="column">
              <GroundCard name="No ground" isActive={selectedGround === null} onClick={() => this.handleClick(null)} />
            </div>
          )
          continue
        }

        const asset = grounds[j]
        if (!asset) break

        row.push(
          <div key={`ground-${i}-${j}`} className="column">
            <GroundCard
              name={asset.name}
              thumbnail={asset.thumbnail}
              isActive={selectedGround === asset.id}
              onClick={() => this.handleClick(asset.id)}
            />
          </div>
        )
      }

      el.push(
        <div key={i} className="row">
          {row}
        </div>
      )
    }

    return el
  }

  getColumnCount(): number {
    return Number(this.props.columnCount)
  }

  render() {
    const { grounds } = this.props

    return (
      <div className="GroundPicker">
        <div className={`ground-grid`}>{this.renderGrid([null, ...Object.values(grounds)])}</div>
      </div>
    )
  }
}
