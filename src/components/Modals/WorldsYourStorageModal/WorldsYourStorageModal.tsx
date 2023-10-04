import * as React from 'react'
import { Button, ModalContent, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { fromBytesToMegabytes } from 'components/WorldListPage_WorldsForEnsOwnersFeature/utils'
import { config } from 'config'
import { InfoIcon } from 'components/InfoIcon'
import goodImg from './images/good.svg'
import { Props, State, WorldsYourStorageModalMetadata } from './WorldsYourStorageModal.types'
import { fetchAccountHoldings, getMbsFromAccountHoldings } from './utils'
import styles from './WorldsYourStorageModal.module.css'

const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL')

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
        <ModalNavigation title={t('worlds_your_storage_modal.your_storage')} onClose={onClose} />
        <ModalContent>
          <div className={styles.total}>
            <span>{t('worlds_your_storage_modal.total_available_storage')}</span>
            <span className={styles.mbs}>
              {fromBytesToMegabytes(Number(stats.maxAllowedSpace) - Number(stats.usedSpace)).toFixed(2)} Mb
            </span>
          </div>
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>{t('worlds_your_storage_modal.mana')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.mana_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img>
                  {t('worlds_your_storage_modal.mana_holdings', {
                    mbs: mbsFromAccountHoldings.manaMbs,
                    owned: Math.trunc(accountHoldings.ownedMana)
                  })}
                </span>
              ) : null}
            </div>
            <div>
              <Button as="a" href={MARKETPLACE_WEB_URL} primary>
                {t('worlds_your_storage_modal.mana_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>{t('worlds_your_storage_modal.lands')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.lands_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img>
                  {t('worlds_your_storage_modal.lands_holdings', {
                    mbs: mbsFromAccountHoldings.landMbs,
                    owned: accountHoldings.ownedLands
                  })}
                </span>
              ) : null}
            </div>
            <div>
              <Button as="a" href={MARKETPLACE_WEB_URL + '/lands'} primary>
                {t('worlds_your_storage_modal.lands_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span>{t('worlds_your_storage_modal.names')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.lands_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings ? (
                <span className={styles.amount}>
                  <img src={goodImg} alt="good"></img>
                  {t('worlds_your_storage_modal.names_holdings', {
                    mbs: mbsFromAccountHoldings.nameMbs,
                    owned: accountHoldings.ownedNames
                  })}
                </span>
              ) : null}
            </div>
            <div>
              <Button as="a" href="/claim-name" primary>
                {t('worlds_your_storage_modal.names_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.proposal}>
            <InfoIcon className={styles.icon} /> <span>{t('worlds_your_storage_modal.proposal')}</span>{' '}
            <a href="https://governance.decentraland.org/proposal/?id=c3216070-e822-11ed-b8f1-75dbe089d333">
              {t('worlds_your_storage_modal.learn_more')}
            </a>
          </div>
        </ModalContent>
      </Modal>
    )
  }
}
