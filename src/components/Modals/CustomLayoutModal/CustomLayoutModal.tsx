import * as React from 'react'
import { Modal, Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { MAX_AREA, fromLayout } from 'modules/template/utils'
import LayoutPicker from 'components/LayoutPicker'
import { Props, State } from './CustomLayoutModal.types'
import CloseModalIcon from '../CloseModalIcon'

import './CustomLayoutModal.css'

export default class CustomLayoutModal extends React.PureComponent<Props, State> {
  state = {
    cols: 4,
    rows: 2,
    error: false
  }

  handleChange = (layout: { cols: number; rows: number }) => {
    const { cols, rows } = layout
    this.setState({ cols, rows, error: cols * rows > MAX_AREA })
  }

  handleClose = () => {
    this.props.onClose('CustomLayoutModal')
  }

  handleCreate = () => {
    const { cols, rows } = this.state
    const { onCreateProject, onClose } = this.props
    onCreateProject(fromLayout({ cols, rows }))
    onClose('CustomLayoutModal')
  }

  render() {
    const { modal } = this.props
    const { cols, rows, error } = this.state

    let errorMessage
    if (error) {
      errorMessage = t('custom_layout.max_area_error', { area: MAX_AREA })
    }

    return (
      <Modal
        open={modal.open}
        className="CustomLayoutModal"
        size="small"
        onClose={this.handleClose}
        closeIcon={<CloseModalIcon onClick={this.handleClose} />}
      >
        <Modal.Header>{t('custom_layout.title')}</Modal.Header>
        <Modal.Description>
          <p>{t('custom_layout.subtitle_one')}</p>
          <p>{t('custom_layout.subtitle_two')}</p>
        </Modal.Description>
        <Modal.Content>
          <LayoutPicker cols={cols} rows={rows} showGrid onChange={this.handleChange} errorMessage={errorMessage} />
          <div className="buttons">
            <Button primary disabled={error} onClick={this.handleCreate}>
              {t('global.create')}
            </Button>
            <Button secondary onClick={this.handleClose}>
              {t('global.cancel')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}
