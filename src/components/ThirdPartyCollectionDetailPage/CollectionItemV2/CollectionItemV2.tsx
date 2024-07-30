import React, { useCallback, useMemo } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Grid, Dropdown, Icon, Button, Checkbox, CheckboxProps, Popup } from 'decentraland-ui'
import { Link, useHistory } from 'react-router-dom'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/event'
import { SyncStatus } from 'modules/item/types'
import { FromParam } from 'modules/location/types'
import ConfirmDelete from 'components/ConfirmDelete'
import { getMapping } from 'modules/item/utils'
import ItemImage from 'components/ItemImage'
import { Props } from './CollectionItemV2.types'
import styles from './CollectionItemV2.module.css'
import { MappingEditor } from 'components/MappingEditor/MappingEditor'

export default function CollectionItemV2({ item, status, selected, contract, onSelect, onOpenModal, onDelete }: Props) {
  const history = useHistory()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const mapping = useMemo(() => getMapping(item), [item])

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

  const handleMappingChange = useCallback(() => {}, [])

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

  return (
    <Grid className={`CollectionItem ${styles.grid}`} columns="equal">
      <Grid.Row className={styles.row}>
        <Grid.Column className={`${styles.column} ${styles.avatarColumn}`} width={5}>
          <Checkbox checked={selected} disabled={item.isPublished} onClick={handleCheckboxChange} />
          <ItemImage className={styles.itemImage} item={item} hasBadge badgeSize="small" />
          <div className={styles.nameWrapper}>
            <div className={styles.name} title={item.name}>
              {item.name}
            </div>
          </div>
        </Grid.Column>
        <Grid.Column>{contract && mapping && <MappingEditor mapping={mapping} onChange={handleMappingChange} isCompact />}</Grid.Column>
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
