import React from 'react'
import { Dropdown, Button, Icon, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { RoleType } from 'modules/collection/types'
import { isOwner as isCollectionOwner, isLocked } from 'modules/collection/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { Props } from './CollectionContextMenu.types'

import styles from './CollectionContextMenu.module.css'

const CollectionContextMenu: React.FC<Props> = ({ collection, wallet, onOpenModal, onDelete }) => {
  const handleUpdateManagers = () => {
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MANAGER, collectionId: collection.id, roles: collection.managers })
  }

  const handleUpdateMinters = () => {
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MINTER, collectionId: collection.id, roles: collection.minters })
  }

  const handleAddExistingItem = () => {
    onOpenModal('AddExistingItemModal', { collectionId: collection.id })
  }

  const handleDeleteCollection = () => {
    onDelete(collection)
  }

  const isOwner = isCollectionOwner(collection, wallet.address)
  return (
    <Dropdown
      className={styles.dropdown}
      trigger={
        <Button basic>
          <Icon className={styles.ellipsis} name="ellipsis horizontal" />
        </Button>
      }
      inline
      direction="left"
    >
      <Dropdown.Menu>
        {collection.isPublished ? (
          isOwner ? (
            <>
              <Dropdown.Item text={t('collection_context_menu.managers')} onClick={handleUpdateManagers} />
              <Dropdown.Item text={t('collection_context_menu.minters')} onClick={handleUpdateMinters} />
            </>
          ) : null
        ) : !isLocked(collection) ? (
          <>
            <Dropdown.Item text={t('collection_context_menu.add_existing_item')} onClick={handleAddExistingItem} />
            <ConfirmDelete name={collection.name} onDelete={handleDeleteCollection} trigger={<Dropdown.Item text={t('global.delete')} />} />
          </>
        ) : null}

        <CopyToClipboard role="option" className="item" text={collection.urn}>
          <Dropdown.Item text={t('collection_context_menu.copy_urn')} />
        </CopyToClipboard>

        <Popup
          content={t('collection_context_menu.unpublished')}
          position="right center"
          disabled={collection.isPublished}
          trigger={
            <CopyToClipboard role="option" className="item" text={collection.contractAddress!}>
              <Dropdown.Item disabled={!collection.isPublished} text={t('collection_context_menu.copy_address')} />
            </CopyToClipboard>
          }
          hideOnScroll={true}
          on="hover"
          inverted
          flowing
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default CollectionContextMenu
