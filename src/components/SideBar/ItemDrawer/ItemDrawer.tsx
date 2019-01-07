import * as React from 'react'
import { Header, Grid } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Drawer from 'components/Drawer'
import AssetCard from 'components/AssetCard'
import { Props, State } from './ItemDrawer.types'
import './ItemDrawer.css'

const COLUMN_COUNT = 3

export default class ItemDrawer extends React.PureComponent<Props, State> {
  state = {
    isList: false
  }

  renderGrid() {
    const { assets } = this.props
    const { isList } = this.state
    let el = []

    for (let i = 0; i < assets.length; i += COLUMN_COUNT) {
      let row = []

      for (let j = i; j < i + COLUMN_COUNT; j++) {
        const item = assets[j]
        if (!item) break

        row.push(
          <Grid.Column>
            <AssetCard asset={item} isHorizontal={isList} />
          </Grid.Column>
        )
      }

      el.push(<Grid.Row>{row}</Grid.Row>)
    }

    return el
  }

  render() {
    const { isList } = this.state

    return (
      <div className="ItemDrawer">
        <Header size="medium" className="title">
          {t('itemDrawer.title')}
        </Header>
        <Drawer label="Category">
          <Grid columns={1} padded="horizontally" className={`asset-grid ${isList ? 'item-list' : 'item-grid'}`}>
            {this.renderGrid()}
          </Grid>
        </Drawer>
      </div>
    )
  }
}
