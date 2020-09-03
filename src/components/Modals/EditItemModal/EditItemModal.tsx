import * as React from 'react'
import { ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'

import NotFound from 'components/NotFound'
import { Props } from './EditItemModal.types'
import './EditItemModal.css'

export default class EditItemModal extends React.PureComponent<Props, {}> {
  handleEdit = () => {
    const { item } = this.props
    console.log('edit', item)
  }

  render() {
    const { name, item, onClose } = this.props

    return (
      <Modal name={name} onClose={onClose}>
        {item ? (
          <>
            <ModalNavigation title={item.name} onClose={onClose} />
          </>
        ) : (
          <NotFound />
        )}
      </Modal>
    )
  }
}
