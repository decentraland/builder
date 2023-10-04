import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button, ModalContent, ModalNavigation } from 'decentraland-ui'
import { Props, WorldsYourStorageModalMetadata } from './WorldsYourStorageModal.types'
import { fromBytesToMegabytes } from 'components/WorldListPage_WorldsForEnsOwnersFeature/utils'
import goodImg from './images/good.svg'
import styles from './WorldsYourStorageModal.module.css'
import { InfoIcon } from 'components/InfoIcon'

export default class WorldsYourStorageModal extends React.PureComponent<Props> {
  render() {
    const { name, onClose, metadata } = this.props

    const { stats } = metadata as WorldsYourStorageModalMetadata

    return (
      <Modal name={name} onClose={onClose}>
        <ModalNavigation title={'Your Storage'} onClose={onClose} />
        <ModalContent>
          <div className={styles.total}>
            <span>TOTAL AVAILABLE STORAGE</span>
            <span className={styles.mbs}>
              {fromBytesToMegabytes(Number(stats.maxAllowedSpace) - Number(stats.usedSpace)).toFixed(2)} Mb
            </span>
          </div>
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>MANA</span>
              <span className={styles.subtitle}>Earn 100 MB of storage per 2,000 tokens (Polygon or Ethereum).</span>
              <span className={styles.amount}>
                <img src={goodImg} alt="good"></img> You have 100 MB thanks to holding 2728 MANA tokens.
              </span>
            </div>
            <div>
              <Button primary>BUY MANA</Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>MANA</span>
              <span className={styles.subtitle}>Earn 100 MB of storage per 2,000 tokens (Polygon or Ethereum).</span>
              <span className={styles.amount}>
                <img src={goodImg} alt="good"></img> You have 100 MB thanks to holding 2728 MANA tokens.
              </span>
            </div>
            <div>
              <Button primary>BUY MANA</Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>MANA</span>
              <span className={styles.subtitle}>Earn 100 MB of storage per 2,000 tokens (Polygon or Ethereum).</span>
              <span className={styles.amount}>
                <img src={goodImg} alt="good"></img> You have 100 MB thanks to holding 2728 MANA tokens.
              </span>
            </div>
            <div>
              <Button primary>BUY MANA</Button>
            </div>
          </div>
          <div className={styles.proposal}>
            <InfoIcon />
            <span>These rules were voted on in the following governance proposal </span>
            <a href="https://governance.decentraland.org/proposal/?id=c3216070-e822-11ed-b8f1-75dbe089d333">LEARN MORE</a>
          </div>
        </ModalContent>
      </Modal>
    )
  }
}
