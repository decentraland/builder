import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button, Checkbox } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import { getMaxSupply } from 'modules/item/utils'
import ItemStatus from 'components/ItemStatus'
import { WearableData } from 'modules/item/types'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'

import './CollectionItem.css'

export default class CollectionItem extends React.PureComponent<Props> {
  handleEditURN = () => {
    // this.props.onOpenModal('EditURNModal')
  }

  handleNavigateToEditor = () => {
    const { onNavigate, item } = this.props
    onNavigate(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }))
  }

  render() {
    const { item } = this.props
    const data = item.data as WearableData

    return (
      <Link to={locations.itemDetail(item.id)} className="CollectionItem">
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column className="avatar-column" width={5}>
              <Checkbox onClick={preventDefault(() => {})} />
              <ItemImage item={item} hasBadge badgeSize="small" />
              <div className="info">
                <div className="name-wrapper">
                  <div className="name" title={item.name}>
                    <ItemStatus item={item} />
                    {item.name}
                  </div>
                </div>
                <div className="subtitle">{item.type}</div>
              </div>
            </Grid.Column>
            <Grid.Column>
              {data.category ? (
                <>
                  <div>{t(`wearable.category.${data.category}`)}</div>
                  <div className="subtitle">{t('item.category')}</div>
                </>
              ) : null}
            </Grid.Column>
            <Grid.Column>
              {item.rarity ? (
                <>
                  <div>{t(`wearable.rarity.${item.rarity}`)}</div>
                  <div className="subtitle">{t('item.rarity')}</div>
                </>
              ) : null}
            </Grid.Column>
            {item.isPublished ? (
              <Grid.Column>
                <>
                  <div>
                    {item.totalSupply}/{getMaxSupply(item)}
                  </div>
                  <div className="subtitle">{t('item.supply')}</div>
                </>
              </Grid.Column>
            ) : null}
            <Grid.Column>
              <div className="item-actions">
                <Dropdown
                  trigger={
                    <Button basic>
                      <Icon name="ellipsis horizontal" />
                    </Button>
                  }
                  inline
                  direction="left"
                  className="action"
                  onClick={preventDefault()}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item text={t('collection_item.see_details')} as={Link} to={locations.itemDetail(item.id)} />
                    <Dropdown.Item text={t('collection_item.open_in_editor')} onClick={this.handleNavigateToEditor} />
                    <Dropdown.Item text={t('collection_item.edit_urn')} onClick={this.handleEditURN} />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Link>
    )
  }
}
