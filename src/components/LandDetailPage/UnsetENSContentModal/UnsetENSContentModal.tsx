import React from 'react'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Modal } from 'decentraland-ui'
import { Link } from 'react-router-dom'
import { locations } from 'routing/locations'
import { Props } from './UnsetENSContentModal.types'

class UnsetENSContentModal extends React.PureComponent<Props> {
  render = () => {
    const { open, ens, land, onCancel, onConfirm } = this.props

    return (
      <Modal size="tiny" open={open}>
        <Modal.Header>{t('land_detail_page.unset_ens_content.title')}</Modal.Header>
        <Modal.Content>
          <T
            id="land_detail_page.unset_ens_content.text"
            values={{ link: ens.subdomain, land: <Link to={locations.landDetail(land.id)}>{land.name}</Link> }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onCancel}>{t('global.cancel')}</Button>
          <Button primary onClick={onConfirm}>
            {t('global.proceed')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default React.memo(UnsetENSContentModal)