import React from 'react'
import { Button, Icon, Modal, ModalContent, ModalNavigation } from 'decentraland-ui'
// Not re-exported from the package root, and ui2's own DownloadModal now targets mobile clients too
import { ExplorerJumpIn } from 'decentraland-ui2/dist/components/Modal/DownloadModal/ExplorerJumpIn'
import styles from './DownloadDesktopAppModal.module.css'
import { Props } from './DownloadDesktopAppModal.types'

/** Prompts the user to download the desktop explorer. */
const DownloadDesktopAppModal = ({ open, title, description, buttonLabel, onClose, onDownloadClick }: Props) => (
  <Modal open={open} size="tiny" onClose={onClose} aria-modal role="dialog">
    <ModalNavigation title="" onClose={onClose} />
    <ModalContent>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <ExplorerJumpIn />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <Button primary onClick={onDownloadClick}>
          {buttonLabel}
          <Icon name="external alternate" className="right" />
        </Button>
      </div>
    </ModalContent>
  </Modal>
)

export default React.memo(DownloadDesktopAppModal)
