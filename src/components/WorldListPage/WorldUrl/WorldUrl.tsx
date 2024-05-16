import { Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import { getExplorerUrl, isWorldDeployed } from '../utils'
import { Props } from './WorldUrl.types'

export default function WorldUrl({ ens, deploymentsByWorlds }: Props) {
  const url = getExplorerUrl(ens.subdomain)
  return isWorldDeployed(deploymentsByWorlds, ens) ? (
    <div className="world-url">
      <span>{url}</span>
      <div className="right">
        <CopyToClipboard role="button" text={url} showPopup={true}>
          <Icon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
        </CopyToClipboard>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Icon name="external alternate" />
        </a>
      </div>
    </div>
  ) : (
    <span className="empty-url">{t('worlds_list_page.table.empty_url')}</span>
  )
}
