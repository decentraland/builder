import React from 'react'
import classNames from 'classnames'
import { Button, Header, ModalContent, ModalNavigation } from 'decentraland-ui'
import { DownloadModal } from 'decentraland-ui2'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { launchExplorerForCollection } from 'modules/collection/explorerDeepLink'
import styles from './SeeInWorldModal.module.css'
import { Props } from './SeeInWorldModal.types'

const DOWNLOAD_URL = 'https://decentraland.org/download'

type State = {
  isDownloadOpen: boolean
  isLaunching: boolean
}

export default class SeeInWorldModal extends React.PureComponent<Props, State> {
  state: State = { isDownloadOpen: false, isLaunching: false }

  handleNavigateToExplorer = async (x: number, y: number) => {
    const { metadata, onClose } = this.props
    // The deep-link only injects an unreleased collection on a cold start of the desktop
    // client; the item-set variant (legacy WITH_ITEMS) isn't supported by the modern explorer,
    // so we bail and close on item-only invocations rather than launch a no-op preview.
    if (!metadata.collectionId) {
      onClose()
      return
    }

    this.setState({ isLaunching: true })
    const launched = await launchExplorerForCollection({ collectionId: metadata.collectionId, position: { x, y } })
    this.setState({ isLaunching: false })

    if (launched) {
      onClose()
    } else {
      this.setState({ isDownloadOpen: true })
    }
  }

  handleCloseDownload = () => {
    this.setState({ isDownloadOpen: false })
    this.props.onClose()
  }

  handleDownloadClick = () => {
    window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
  }

  renderOption = (title: string, subtitle: string, position: { x: number; y: number }, imageClass: string) => {
    const { isLaunching } = this.state
    return (
      <div className={styles.option}>
        <Header className={styles.headers} as="h2">
          {title}
        </Header>
        <Header className={styles.headers} as="h4">
          {subtitle}
        </Header>
        <div className={styles.imageWrapper}>
          <div className={classNames(styles.image, imageClass)}></div>
        </div>
        <Button primary fluid size="small" disabled={isLaunching} onClick={() => this.handleNavigateToExplorer(position.x, position.y)}>
          {t('see_in_world_modal.jump_in')}
        </Button>
      </div>
    )
  }

  render() {
    const { onClose } = this.props
    const { isDownloadOpen } = this.state

    return (
      <>
        <Modal size="small" onClose={onClose} aria-modal role="dialog">
          <ModalNavigation title={t('see_in_world_modal.title')} subtitle={t('see_in_world_modal.subtitle')} onClose={onClose} />
          <ModalContent>
            <div className={styles.content}>
              {this.renderOption(
                t('see_in_world_modal.empty_parcel.title'),
                t('see_in_world_modal.empty_parcel.subtitle'),
                { x: 150, y: -150 },
                styles.emptyParcel
              )}
              {this.renderOption(
                t('see_in_world_modal.genesis.title'),
                t('see_in_world_modal.genesis.subtitle'),
                { x: 0, y: 0 },
                styles.genesis
              )}
            </div>
          </ModalContent>
        </Modal>
        <DownloadModal
          open={isDownloadOpen}
          onClose={this.handleCloseDownload}
          title={t('see_in_world_modal.download.title')}
          description={t('see_in_world_modal.download.description')}
          buttonLabel={t('see_in_world_modal.download.button')}
          onDownloadClick={this.handleDownloadClick}
        />
      </>
    )
  }
}
