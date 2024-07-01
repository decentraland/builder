import { t } from 'decentraland-dapps/dist/modules/translation'
import { useHistory } from 'react-router-dom'
import { Loader, Message, Table, Empty, Button } from 'decentraland-ui'
import { formatNumber } from 'decentraland-dapps/dist/lib'
import { useCallback } from 'react'
import { config } from 'config'
import { locations } from 'routing/locations'
import Profile from 'components/Profile'
import { ENS } from 'modules/ens/types'
import { fromBytesToMegabytes } from '../utils'
import { Props } from './WorldContributorTab.types'
import WorldUrl from '../WorldUrl'
import PublishSceneButton from '../PublishSceneButton'

export default function WorldContributorTab({ items, deploymentsByWorlds, projects, loading, error, onUnpublishWorld }: Props) {
  const history = useHistory()
  const handlePublishScene = useCallback(() => {
    history.push(locations.scenes())
  }, [history])

  const handleEditScene = useCallback(
    (ens: ENS) => {
      const { projectId } = deploymentsByWorlds[ens.subdomain]
      history.push(locations.sceneDetail(projectId as string))
    },
    [deploymentsByWorlds, locations, history]
  )

  const handleUnpublishScene = useCallback(
    (ens: ENS) => {
      const deploymentId = deploymentsByWorlds[ens.subdomain]?.id
      if (deploymentId) {
        onUnpublishWorld(deploymentId)
      }
    },
    [deploymentsByWorlds, onUnpublishWorld]
  )

  if (error) {
    return <Message error size="tiny" visible content={error.message} header={t('worlds_list_page.error_title')} />
  }

  if (loading) {
    return <Loader active size="big" />
  }

  if (!items.length) {
    return (
      <Empty className="empty-names-container" height={500}>
        <div className="empty-icon dcl-icon" />
        <div className="empty-title">{t('worlds_list_page.empty_contributor_list.title')}</div>
        <div className="empty-description">
          {t('worlds_list_page.empty_contributor_list.description', { b: (text: string) => <b>{text}</b> })}
        </div>
        <Button as="a" href={`${config.get('MARKETPLACE_WEB_URL')}/names/claim`} target="_blank" className="empty-action" primary>
          {t('worlds_list_page.empty_list.cta')}
        </Button>
      </Empty>
    )
  }

  return (
    <Table basic="very">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width="1">{t('worlds_list_page.table.name')}</Table.HeaderCell>
          <Table.HeaderCell width="1">{t('worlds_list_page.table.owner')}</Table.HeaderCell>
          <Table.HeaderCell width="2">{t('worlds_list_page.table.url')}</Table.HeaderCell>
          <Table.HeaderCell width="1">{t('worlds_list_page.table.published_scene')}</Table.HeaderCell>
          <Table.HeaderCell width="1">{t('worlds_list_page.table.size')}</Table.HeaderCell>
          <Table.HeaderCell width="1">{t('worlds_list_page.table.permissions')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((ens: ENS, index) => {
          const canUserDeploy = ens.userPermissions?.includes('deployment')
          const userPermissions = ens.userPermissions
            ?.map(permission => t(`worlds_list_page.table.user_permissions.${permission}`))
            .join('/')
          return (
            <Table.Row className="TableRow" key={index}>
              <Table.Cell width={1}>{ens.name}</Table.Cell>
              <Table.Cell width={1}>{<Profile address={ens.nftOwnerAddress || ''} />}</Table.Cell>
              <Table.Cell width={2}>{<WorldUrl deploymentsByWorlds={deploymentsByWorlds} ens={ens} />}</Table.Cell>
              <Table.Cell width={1}>
                <PublishSceneButton
                  deploymentsByWorlds={deploymentsByWorlds}
                  ens={ens}
                  projects={projects}
                  onEditScene={canUserDeploy ? handleEditScene : undefined}
                  onPublishScene={canUserDeploy ? handlePublishScene : undefined}
                  onUnpublishScene={canUserDeploy ? handleUnpublishScene : undefined}
                />
              </Table.Cell>
              <Table.Cell width={1}>{formatNumber(fromBytesToMegabytes(Number(ens.size) || 0))}</Table.Cell>
              <Table.Cell width={1}>{userPermissions}</Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}
