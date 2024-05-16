import { render } from '@testing-library/react'
import { ENS } from 'modules/ens/types'
import WorldUrl from './WorldUrl'
import { Props } from './WorldUrl.types'
import { Deployment } from 'modules/deployment/types'
import { getExplorerUrl } from '../utils'
import { t } from 'decentraland-dapps/dist/modules/translation'

const ens = {
  name: 'test.dcl.eth',
  subdomain: 'test.dcl.eth',
  worldStatus: { healthy: true }
} as ENS

let deploymentsByWorlds: Record<string, Deployment>

function renderWorldUrl(props: Partial<Props>) {
  return render(<WorldUrl ens={ens} deploymentsByWorlds={{}} {...props} />)
}

describe('when world has a scene deployed', () => {
  it('should show world url', () => {
    deploymentsByWorlds = {
      [ens.subdomain]: {
        projectId: 'projectId'
      } as Deployment
    }
    const screen = renderWorldUrl({ deploymentsByWorlds })
    expect(screen.getByText(getExplorerUrl(ens.subdomain))).toBeInTheDocument()
  })
})

describe('when world has no scene deployed', () => {
  it('should show world url', () => {
    deploymentsByWorlds = {}
    const screen = renderWorldUrl({ deploymentsByWorlds })
    expect(screen.getByText(t('worlds_list_page.table.empty_url'))).toBeInTheDocument()
  })
})
