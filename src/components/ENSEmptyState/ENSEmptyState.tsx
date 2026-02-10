import { Button } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { config } from 'config'
import namesImg from '../../images/empty-names.svg'
import './ENSEmptyState.css'

const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL', '')

export default function ENSEmptyState() {
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
