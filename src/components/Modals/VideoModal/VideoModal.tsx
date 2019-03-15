import * as React from 'react'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { CloseModal } from '..'

import './VideoModal.css'

const YOUTUBE_ID = 'dQw4w9WgXcQ'

export const LOCALSTORAGE_TUTORIAL_EMAIL_KEY = 'builder-tutorial-email'

export default class TutorialModal extends React.PureComponent<ModalProps> {
  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeIcon={<CloseModal onClick={onClose} />}>
        <Modal.Header>{t('contest.banner.title')}</Modal.Header>
        <Modal.Content>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Modal.Content>
      </Modal>
    )
  }
}
