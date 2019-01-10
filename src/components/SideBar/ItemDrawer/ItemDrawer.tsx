import * as React from 'react'
import { Header, Grid } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import { Asset } from 'modules/asset/types'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'

const DEFAULT_COLUMN_COUNT = 3

export default class ItemDrawer extends React.PureComponent<Props, State> {
  state = {
    isList: false
  }

  renderGrid(assets: Asset[]) {
    const { isList } = this.state
    const { columnCount = DEFAULT_COLUMN_COUNT } = this.props
    let el = []

    for (let i = 0; i < assets.length; i += columnCount) {
      let row = []

      for (let j = i; j < i + columnCount; j++) {
        const item = assets[j]
        if (!item) break

        row.push(
          <Grid.Column key={item.id}>
            <AssetCard asset={item} isHorizontal={isList} />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row key={i}>{row}</Grid.Row>)
    }

    return el
  }

  render() {
    const { isList } = this.state
    const { categories } = this.props

    return (
      <div className="ItemDrawer">
        <Header size="medium" className="title">
          {t('itemDrawer.title')}
        </Header>
        {categories.map((category, index) => (
          <Drawer key={index} label={category.name}>
            <Grid columns={1} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
              {this.renderGrid(category.assets)}
            </Grid>
          </Drawer>
        ))}
      </div>
    )
  }
}
