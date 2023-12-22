import * as React from 'react'
import { Button, ModalContent, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { formatNumber } from 'decentraland-dapps/dist/lib/utils'
import { track } from 'modules/analytics/sagas'
import { fromBytesToMegabytes } from 'components/WorldListPage_WorldsForEnsOwnersFeature/utils'
import { config } from 'config'
import { InfoIcon } from 'components/InfoIcon'
import goodImg from './images/good.svg'
import { Props, State, WorldsYourStorageModalMetadata } from './WorldsYourStorageModal.types'
import { fetchAccountHoldings, getMbsFromAccountHoldings } from './utils'
import styles from './WorldsYourStorageModal.module.css'

const MODAL_ACTION_EVENT = 'Worlds Your Storage Modal Action'
const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL')
const ACCOUNT_URL = config.get('ACCOUNT_URL')

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
              {formatNumber(fromBytesToMegabytes(Number(stats.maxAllowedSpace) - Number(stats.usedSpace)))} Mb
            </span>
          </div>
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span className={styles.name}>{t('worlds_your_storage_modal.mana')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.mana_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings && mbsFromAccountHoldings.manaMbs > 0 ? (
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
              <Button
                as="a"
                href={ACCOUNT_URL}
                primary
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track(MODAL_ACTION_EVENT, { action: 'Click Buy MANA' })
                }}
              >
                {t('worlds_your_storage_modal.mana_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span className={styles.name}>{t('worlds_your_storage_modal.lands')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.lands_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings && mbsFromAccountHoldings.landMbs > 0 ? (
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
              <Button
                as="a"
                href={MARKETPLACE_WEB_URL + '/lands'}
                primary
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track(MODAL_ACTION_EVENT, { action: 'Click Buy LAND' })
                }}
              >
                {t('worlds_your_storage_modal.lands_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.separator} />
          <div className={styles.asset}>
            <div className={styles.texts}>
              <span className={styles.name}>{t('worlds_your_storage_modal.names')}</span>
              <span className={styles.subtitle}>{t('worlds_your_storage_modal.names_earn_storage')}</span>
              {accountHoldings && mbsFromAccountHoldings && mbsFromAccountHoldings.nameMbs > 0 ? (
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
              <Button
                as="a"
                to={`${MARKETPLACE_WEB_URL}/names/mints`}
                primary
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track(MODAL_ACTION_EVENT, { action: 'Click Buy NAME' })
                }}
              >
                {t('worlds_your_storage_modal.names_buy')}
              </Button>
            </div>
          </div>
          <div className={styles.proposal}>
            <InfoIcon className={styles.icon} /> <span>{t('worlds_your_storage_modal.proposal')}</span>{' '}
            <a
              href="https://governance.decentraland.org/proposal/?id=c3216070-e822-11ed-b8f1-75dbe089d333"
              onClick={() => {
                track('Worlds Your Storage Modal Action', { action: 'Click Learn More' })
              }}
            >
              {t('worlds_your_storage_modal.learn_more')}
            </a>
          </div>
        </ModalContent>
      </Modal>
    )
  }
}
