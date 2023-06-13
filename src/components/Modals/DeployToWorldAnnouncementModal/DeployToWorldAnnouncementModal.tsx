import React from 'react'
import { Button, Close } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getLocalStorage } from 'decentraland-dapps/dist/lib/localStorage'
import { LOCALSTORAGE_DEPLOY_TO_WORLD_ANNOUCEMENT } from 'components/ScenesPage/ScenesPage'
import { Props } from './DeployToWorldAnnouncementModal.types'
import './DeployToWorldAnnouncementModal.css'

const localStorage = getLocalStorage()

const DeployToWorldAnnouncementModal: React.FC<Props> = ({ name, onClose, onOpenModal }) => {
  const handleClose = () => {
    localStorage.setItem(LOCALSTORAGE_DEPLOY_TO_WORLD_ANNOUCEMENT, '1')
    onClose()
  }

  const handleCreateScene = () => {
    handleClose()
    onOpenModal('CustomLayoutModal')
  }

  return (
    <Modal name={name} onClose={handleClose} closeIcon={<Close onClick={handleClose} />}>
      <Modal.Content>
        <h1 className="title">{t('deploy_to_world_announcement_modal.title', { br: () => <br /> })}</h1>
        <div className="thumbnail" aria-label="publish-scenes" role="img" />
        <span className="description">{t('deploy_to_world_announcement_modal.description')}</span>
      </Modal.Content>
      <Modal.Actions>
        <Button primary className="create-scene" onClick={handleCreateScene}>
          {t('deploy_to_world_announcement_modal.create_scene')}
        </Button>
        <Button
          inverted
          as="a"
          href="https://decentraland.org/blog/announcements/introducing-decentraland-worlds-beta-your-own-3d-space-in-the-metaverse"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('global.learn_more')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(DeployToWorldAnnouncementModal)
