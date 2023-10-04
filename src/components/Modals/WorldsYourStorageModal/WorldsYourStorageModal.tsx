import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Button, ModalContent, ModalNavigation } from 'decentraland-ui'
import { Props, State, WorldsYourStorageModalMetadata } from './WorldsYourStorageModal.types'
import { fromBytesToMegabytes } from 'components/WorldListPage_WorldsForEnsOwnersFeature/utils'
import goodImg from './images/good.svg'
import styles from './WorldsYourStorageModal.module.css'
import { InfoIcon } from 'components/InfoIcon'
import { fetchAccountHoldings, getMbsFromAccountHoldings } from './utils'

export default class WorldsYourStorageModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      accountHoldings: null
    }
  }

  async componentDidMount() {
    const { metadata } = this.props

    const { stats } = metadata as WorldsYourStorageModalMetadata

    const accountHoldings = await fetchAccountHoldings(stats.wallet)

    this.setState({ accountHoldings })
  }

  render() {
    const { name, onClose, metadata } = this.props

    const { stats } = metadata as WorldsYourStorageModalMetadata

    const { accountHoldings } = this.state

    const mbsFromAccountHoldings = accountHoldings ? getMbsFromAccountHoldings(accountHoldings) : null

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
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img> You have {Math.trunc(mbsFromAccountHoldings.manaMbs)} MB thanks to holding{' '}
                  {Math.trunc(accountHoldings.ownedMana)} MANA tokens.
                </span>
              ) : null}
            </div>
            <div>
              <Button primary>BUY MANA</Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>LANDs</span>
              <span className={styles.subtitle}>Earn 100 MB of storage per LAND.</span>
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img> You have {mbsFromAccountHoldings.landMbs} MB thanks to holding{' '}
                  {accountHoldings.ownedLands} LANDs.
                </span>
              ) : null}
            </div>
            <div>
              <Button primary>BUY LAND</Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>NAMEs</span>
              <span className={styles.subtitle}>Earn 100 MB of storage per NAME.</span>
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img> You have {mbsFromAccountHoldings.nameMbs} MB thanks to holding{' '}
                  {Math.trunc(accountHoldings.ownedNames)} NAMEs.
                </span>
              ) : null}
            </div>
            <div>
              <Button primary>BUY NAME</Button>
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
