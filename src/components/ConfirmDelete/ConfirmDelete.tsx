import React from 'react'
import { Confirm } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props, State } from './ConfirmDelete.types'

export default class ConfirmDelete extends React.PureComponent<Props, State> {
  static defaultProps = {
    size: 'tiny'
  }

  state = {
    isOpen: false
  }

  handleToggleConfirmModal = () => {
    const { isOpen } = this.state
    this.setState({ isOpen: !isOpen })
  }

  handleDeleteItem = () => {
    this.props.onDelete()
    this.handleToggleConfirmModal()
  }

  render() {
    const { name, size, trigger } = this.props
    const { isOpen } = this.state

    return (
      <>
        <Confirm
          size={size}
          open={isOpen}
          content={t('confirm_delete.content', { name })}
          onCancel={this.handleToggleConfirmModal}
          onConfirm={this.handleDeleteItem}
        />
        {React.cloneElement(trigger, { onClick: this.handleToggleConfirmModal })}
      </>
    )
  }
}
