import * as React from 'react'
import { Dropdown, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './Header.types'
import './Header.css'
import { locations } from 'routing/locations'

export default class Header extends React.PureComponent<Props> {
  renderSelectedCollection() {
    const { collection, onNavigate, onOpenModal, onDeleteCollection } = this.props

    return (
      <>
        <div className="block back" onClick={() => onNavigate(locations.itemEditor())} />
        <div className="title">{collection!.name}</div>
        <Dropdown trigger={<div className="block actions" />} inline direction="left">
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onOpenModal('CreateItemModal', { collectionId: collection!.id })}>
              {t('item_editor.left_panel.actions.new_item')}
            </Dropdown.Item>
            <ConfirmDelete
              name={collection!.name}
              onDelete={() => onDeleteCollection(collection!)}
              trigger={<Dropdown.Item text={t('global.delete')} />}
            />
          </Dropdown.Menu>
        </Dropdown>
      </>
    )
  }

  renderHeader() {
    const { onNavigate, onOpenModal } = this.props
    return (
      <>
        <div className="block home" onClick={() => onNavigate(locations.avatar())} />
        <div className="title">{t('item_editor.left_panel.title')}</div>
        <Dropdown trigger={<div className="block add" />} inline direction="left">
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onOpenModal('CreateItemModal')}>{t('item_editor.left_panel.actions.new_item')}</Dropdown.Item>
            <Dropdown.Item onClick={() => onOpenModal('CreateCollectionModal')}>
              {t('item_editor.left_panel.actions.new_collection')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
    )
  }

  render() {
    const { collection } = this.props
    return <Row className="Header">{collection ? this.renderSelectedCollection() : this.renderHeader()}</Row>
  }
}
