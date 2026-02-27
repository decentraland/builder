import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import namesImg from '../../images/empty-names.svg'
import './ENSEmptyState.css'

const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')

type Props = {
  name?: string | null
  error?: string | null
}

export default function ENSEmptyState({ name, error }: Props) {
  const isNameUnavailable = error === 'Name unavailable'

  if (isNameUnavailable && name) {
    return (
      <div className="ens-empty-state">
        <div className="ens-empty-state-image">
          <img src={namesImg} alt="empty names" />
        </div>
        <h3 className="ens-empty-state-title">Unavailable NAME</h3>
        <span className="ens-empty-state-subtitle">See if it's on sale in the Marketplace</span>
        <div className="ens-empty-state-actions">
          <Button
            primary
            href={`${MARKETPLACE_WEB_URL}/names/browse?section=ens&sortBy=newest&onlyOnSale=false&search=${name}`}
            target="_blank"
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="ens-empty-state">
      <div className="ens-empty-state-image">
        <img src={namesImg} alt="empty names" />
      </div>
      <h3 className="ens-empty-state-title">{t('ens_list_page.empty_state.title')}</h3>
      <span className="ens-empty-state-subtitle">{t('ens_list_page.empty_state.subtitle')}</span>
      <div className="ens-empty-state-actions">
        <Button primary href={`${MARKETPLACE_WEB_URL}/names/claim`} target="_blank">
          {t('ens_list_page.empty_state.mint_name')}
        </Button>
      </div>
    </div>
  )
}
