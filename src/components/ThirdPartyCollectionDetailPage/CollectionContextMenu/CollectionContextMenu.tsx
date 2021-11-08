import * as React from 'react'
import { Dropdown, Button, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getCollectionEditorURL, getExplorerURL, isLocked } from 'modules/collection/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './CollectionContextMenu.types'
import './CollectionContextMenu.css'

export default class CollectionContextMenu extends React.PureComponent<Props> {
  handleNavigateToExplorer = () => {
    const { collection } = this.props
    this.navigateTo(getExplorerURL(collection), '_blank')
  }

  handleNavigateToEditor = () => {
    const { collection, items, onNavigate } = this.props
    onNavigate(getCollectionEditorURL(collection, items))
  }

  handleDeleteCollection = () => {
    const { collection, onDelete } = this.props
    onDelete(collection)
  }

  handleEditURN = () => {
    // this.props.onOpenModal('EditURNModal')
  }

  navigateTo = (url: string, target: string = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  render() {
    const { collection } = this.props
    return (
      <Dropdown
        className="CollectionContextMenu"
        trigger={
          <Button basic>
            <Icon name="ellipsis horizontal" />
          </Button>
        }
        inline
        direction="left"
      >
        <Dropdown.Menu>
          <Dropdown.Item text={t('collection_context_menu.see_in_world')} onClick={this.handleNavigateToExplorer} />
          <Dropdown.Item text={t('collection_context_menu.open_in_editor')} onClick={this.handleNavigateToEditor} />

          {!isLocked(collection) ? (
            <>
              <ConfirmDelete
                name={collection.name}
                onDelete={this.handleDeleteCollection}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            </>
          ) : null}

          <Dropdown.Item text={t('collection_context_menu.edit_urn')} onClick={this.handleEditURN} />
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
