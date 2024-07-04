import React, { useCallback, useMemo } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button, Checkbox, CheckboxProps, Popup } from 'decentraland-ui'
import { Link, useHistory } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { decodeURN, isThirdPartyCollectionDecodedUrn, isThirdPartyV2CollectionDecodedUrn } from 'lib/urn'
import ItemStatus from 'components/ItemStatus'
import { SyncStatus } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import { getBodyShapeType } from 'modules/item/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItem.types'
import styles from './CollectionItem.module.css'

export default function CollectionItem({ item, status, selected, onSelect, onOpenModal, onDelete }: Props) {
  const history = useHistory()

  const handleCheckboxChange = useCallback(
    (_event: React.MouseEvent<HTMLInputElement>, data: CheckboxProps) => {
      onSelect(item, data.checked!)
    },
    [item, onSelect]
  )

  const handleSeeInWorld = useCallback(() => {
    onOpenModal('SeeInWorldModal', { itemIds: [item.id] })
  }, [item, onOpenModal])

  const handleEditURN = useCallback(() => {
    if (!item.isPublished) {
      onOpenModal('EditItemURNModal', { item })
    }
  }, [item, onOpenModal])

  const handleNavigateToEditor = useCallback(() => {
    history.push(locations.itemEditor({ itemId: item.id, collectionId: item.collectionId }), { fromParam: FromParam.TP_COLLECTIONS })
  }, [item, history])

  const handleDelete = useCallback(() => {
    onDelete(item)
  }, [onDelete, item])

  const tokenId = useMemo(() => {
    if (!item.urn) {
      return ''
    }

    try {
      const decodedURN = decodeURN(item.urn)
      return isThirdPartyCollectionDecodedUrn(decodedURN) || isThirdPartyV2CollectionDecodedUrn(decodedURN)
        ? decodedURN.thirdPartyTokenId ?? ''
        : ''
    } catch (error) {
      return ''
    }
  }, [item])

  const statusIcon = useMemo(() => {
    switch (status) {
      case SyncStatus.UNDER_REVIEW:
        return <Icon name="clock outline" />
      case SyncStatus.SYNCED:
        return <Icon name="check circle outline" />
      case SyncStatus.UNSYNCED:
        return <Icon name="exclamation circle" />
      default:
        return null
    }
  }, [status])

  const data = item.data

  return (
    <Grid className={`CollectionItem ${styles.grid}`} columns="equal">
      <Grid.Row className={styles.row}>
        <Grid.Column className={`${styles.column} ${styles.avatarColumn}`} width={5}>
          <Checkbox checked={selected} disabled={item.isPublished} onClick={handleCheckboxChange} />
          <ItemImage className={styles.itemImage} item={item} hasBadge badgeSize="small" />
          <div className={styles.nameWrapper}>
            <div className={styles.name} title={item.name}>
              <ItemStatus className={styles.itemStatus} item={item} />
              {item.name}
            </div>
          </div>
        </Grid.Column>
        <Grid.Column className={styles.column}>{data.category ? <div>{t(`wearable.category.${data.category}`)}</div> : null}</Grid.Column>
        <Grid.Column className={styles.column}>
          <div>{t(`body_shapes.${getBodyShapeType(item)}`)}</div>
        </Grid.Column>
        <Grid.Column className={styles.column}>
          <div>{tokenId}</div>
        </Grid.Column>
        <Grid.Column width={3} className={`${styles.column} ${styles.statusColumn} ${styles[status]}`}>
          {statusIcon}
          <div>{t(`third_party_collection_detail_page.synced_statuses.${status}`)}</div>
        </Grid.Column>
        <Grid.Column width={1} className={styles.column}>
          <div className={styles.itemActions}>
            <Dropdown
              trigger={
                <Button basic>
                  <Icon name="ellipsis horizontal" />
                </Button>
              }
              inline
              direction="left"
              className={styles.action}
              onClick={preventDefault()}
            >
              <Dropdown.Menu>
                <Dropdown.Item text={t('collection_item.see_details')} as={Link} to={locations.itemDetail(item.id)} />
                <Dropdown.Item text={t('collection_context_menu.see_in_decentraland')} onClick={handleSeeInWorld} />
                <Dropdown.Item text={t('global.open_in_editor')} onClick={handleNavigateToEditor} />
                <Popup
                  content={t('collection_item.cannot_edit_urn')}
                  position="right center"
                  disabled={!item.isPublished}
                  trigger={<Dropdown.Item text={t('collection_item.edit_urn')} onClick={handleEditURN} disabled={item.isPublished} />}
                  hideOnScroll={true}
                  on="hover"
                  inverted
                  flowing
                />
                {!item.isPublished && (
                  <ConfirmDelete name={item.name} onDelete={handleDelete} trigger={<Dropdown.Item text={t('global.delete')} />} />
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
