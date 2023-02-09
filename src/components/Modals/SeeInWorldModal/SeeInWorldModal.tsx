import React from 'react'
import classNames from 'classnames'
import { Button, Header, ModalContent, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getExplorerURL } from 'modules/collection/utils'
import styles from './SeeInWorldModal.module.css'
import { Props } from './SeeInWorldModal.types'

export default class SeeInWorldModal extends React.PureComponent<Props> {
  handleNavigateToExplorer = (x: number, y: number) => {
    const { metadata, onClose } = this.props
    const url = getExplorerURL({ collectionId: metadata.collectionId, item_ids: metadata.itemIds, position: { x, y } })
    window.open(url, '_blank,noreferrer')
    onClose()
  }

  renderOption = (title: string, subtitle: string, position: { x: number; y: number }, imageClass: string) => {
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
        <Button primary fluid size="small" onClick={() => this.handleNavigateToExplorer(position.x, position.y)}>
          {t('see_in_world_modal.jump_in')}
        </Button>
      </div>
    )
  }

  render() {
    const { onClose } = this.props

    return (
      <Modal size="small" onClose={onClose} aria-modal role="dialog">
        <ModalNavigation title={t('see_in_world_modal.title')} subtitle={t('see_in_world_modal.subtitle')} onClose={onClose} />
        <ModalContent>
          <div className={styles.content}>
            {this.renderOption(
              t('see_in_world_modal.empty_parcel.title'),
              t('see_in_world_modal.empty_parcel.subtitle'),
              { x: 100, y: 100 },
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
    )
  }
}
