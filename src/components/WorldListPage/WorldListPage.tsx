import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { formatNumber } from 'decentraland-dapps/dist/lib/utils'
import {
  Button,
  Table,
  Row,
  Column,
  Header,
  Section,
  Container,
  Pagination,
  Dropdown,
  Empty,
  Icon as DCLIcon,
  Popup
} from 'decentraland-ui'
import { config } from 'config'
import { isDevelopment } from 'lib/environment'
import { WorldsWalletStats } from 'lib/api/worlds'
import { ENS } from 'modules/ens/types'
import { isExternalName } from 'modules/ens/utils'
import { track } from 'modules/analytics/sagas'
import { locations } from 'routing/locations'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import Icon from 'components/Icon'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { canOpenWorldsForENSOwnersAnnouncementModal } from 'components/Modals/WorldsForENSOwnersAnnouncementModal/utils'
import { Props, SortBy } from './WorldListPage.types'
import NameTabs from './NameTabs'
import WorldsStorage from './WorldsStorage'
import { TabType, useCurrentlySelectedTab } from './hooks'
import { DCLWorldsStatus, fromBytesToMegabytes, getDCLWorldsStatus } from './utils'
import './WorldListPage.css'

const PAGE_ACTION_EVENT = 'Worlds List Page Action'
const EXPLORER_URL = config.get('EXPLORER_URL', '')
const WORLDS_CONTENT_SERVER_URL = config.get('WORLDS_CONTENT_SERVER', '')
const ENS_DOMAINS_URL = config.get('ENS_DOMAINS_URL', '')
const MARKETPLACE_WEB_URL = config.get('MARKETPLACE_WEB_URL')
const PAGE_SIZE = 12

const WorldListPage: React.FC<Props> = props => {
  const {
    ensList,
    externalNames,
    error,
    deploymentsByWorlds,
    isLoading,
    projects,
    worldsWalletStats,
    onNavigate,
    onOpenYourStorageModal,
    onOpenWorldsForENSOwnersAnnouncementModal,
    onUnpublishWorld
  } = props
  const [sortBy, setSortBy] = useState(SortBy.ASC)
  const [page, setPage] = useState(1)
  const { tab } = useCurrentlySelectedTab()

  const isWorldDeployed = useCallback(
    (ens: ENS) => {
      if (ens.worldStatus?.healthy) {
        return !!deploymentsByWorlds[ens.subdomain]
      }

      return false
    },
    [deploymentsByWorlds]
  )

  const getExplorerUrl = useCallback(
    (world: string) => {
      if (isDevelopment) {
        return `${EXPLORER_URL}/?realm=${WORLDS_CONTENT_SERVER_URL}/world/${world}&NETWORK=sepolia`
      }
      return `${EXPLORER_URL}?realm=${world}`
    },
    [isDevelopment]
  )

  const handleClaimENS = useCallback(() => {
    if (tab === TabType.DCL) {
      track(PAGE_ACTION_EVENT, { action: 'Click Claim NAME' })
      window.open(`${MARKETPLACE_WEB_URL}/names/mint`, '_blank', 'noopener,noreferrer')
    } else {
      track(PAGE_ACTION_EVENT, { action: 'Click Claim ENS Domain' })
      window.open(ENS_DOMAINS_URL, '_blank', 'noopener,noreferrer')
    }
  }, [tab])

  const handlePublishScene = useCallback(() => {
    onNavigate(locations.scenes())
  }, [locations, onNavigate])

  const handleEditScene = useCallback(
    (ens: ENS) => {
      const { projectId } = deploymentsByWorlds[ens.subdomain]
      onNavigate(locations.sceneDetail(projectId as string))
    },
    [deploymentsByWorlds, locations, onNavigate]
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

  const renderSortDropdown = useCallback(() => {
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.ASC, text: t('global.order.name_asc') },
          { value: SortBy.DESC, text: t('global.order.name_desc') }
        ]}
        onChange={(_event, { value }) => setSortBy(value as SortBy)}
      />
    )
  }, [sortBy, setSortBy])

  const paginate = useCallback((): ENS[] => {
    const list = tab === TabType.DCL ? ensList : externalNames

    return list
      .sort((a: ENS, b: ENS) => {
        switch (sortBy) {
          case SortBy.ASC: {
            return a.subdomain.toLowerCase() > b.subdomain.toLowerCase() ? 1 : -1
          }
          case SortBy.DESC: {
            return a.subdomain.toLowerCase() < b.subdomain.toLowerCase() ? 1 : -1
          }
          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }, [ensList, externalNames, page, sortBy, tab])

  const renderWorldUrl = useCallback(
    (ens: ENS) => {
      const url = getExplorerUrl(ens.subdomain)
      return isWorldDeployed(ens) ? (
        <div className="world-url">
          <span>{url}</span>
          <div className="right">
            <CopyToClipboard role="button" text={url} showPopup={true}>
              <DCLIcon aria-label="Copy urn" aria-hidden="false" className="link copy" name="copy outline" />
            </CopyToClipboard>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <DCLIcon name="external alternate" />
            </a>
          </div>
        </div>
      ) : (
        <span className="empty-url">{t('worlds_list_page.table.empty_url')}</span>
      )
    },
    [getExplorerUrl, isWorldDeployed]
  )

  const renderWorldStatus = useCallback(
    (ens: ENS) => {
      let status = isWorldDeployed(ens) ? 'active' : 'inactive'

      if (status === 'active' && worldsWalletStats && !isExternalName(ens.subdomain)) {
        const worldsStatus = getDCLWorldsStatus(worldsWalletStats)

        switch (worldsStatus.status) {
          case DCLWorldsStatus.BLOCKED: {
            status = 'blocked'
            break
          }
          case DCLWorldsStatus.TO_BE_BLOCKED: {
            status = 'warning'
          }
        }
      }

      return <span className={`world-status ${status}`}>{t(`worlds_list_page.table.status_${status}`)}</span>
    },
    [getDCLWorldsStatus, isExternalName, isWorldDeployed]
  )

  const renderPublishSceneButton = useCallback(
    (ens: ENS) => {
      const deployment = deploymentsByWorlds[ens.subdomain]
      return isWorldDeployed(ens) ? (
        <div className="publish-scene">
          <Popup content={deployment?.name} on="hover" trigger={<span>{deployment?.name}</span>} />
          {projects.find(project => project.id === deployment?.projectId) ? (
            <Button inverted size="small" onClick={() => handleEditScene(ens)}>
              {t('worlds_list_page.table.edit_scene')}
            </Button>
          ) : (
            <Popup
              content={t('worlds_list_page.table.scene_published_outside_builder')}
              on="hover"
              position="top center"
              trigger={
                <Button inverted size="small" onClick={() => handleUnpublishScene(ens)}>
                  {t('worlds_list_page.table.unpublish_scene')}
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="publish-scene">
          <span>-</span>
          <Button primary size="small" onClick={handlePublishScene}>
            {t('worlds_list_page.table.publish_scene')}
          </Button>
        </div>
      )
    },
    [deploymentsByWorlds, projects, isWorldDeployed, handleEditScene, handlePublishScene, handleUnpublishScene]
  )

  const renderWorldSize = useCallback(
    (ens: ENS, stats?: WorldsWalletStats) => {
      const names = tab === TabType.DCL ? stats?.dclNames : stats?.ensNames

      if (!isWorldDeployed(ens) || !names) {
        return '-'
      }

      const bytes = names.find(dclName => dclName.name === ens.subdomain)?.size
      const suffix = tab === TabType.ENS ? ' / 25' : ''

      return formatNumber(fromBytesToMegabytes(Number(bytes))) + suffix
    },
    [tab, isWorldDeployed]
  )

  const renderList = useCallback(() => {
    const total = tab === TabType.DCL ? ensList.length : externalNames.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedItems = paginate()

    return (
      <>
        <div className="filters">
          <Container>
            <Row>
              <Column>
                <Row>
                  <Header sub className="items-count">
                    {t('ens_list_page.items', { count: total.toLocaleString() })}
                  </Header>
                </Row>
              </Column>
              <Column align="right">
                <Row>{renderSortDropdown()}</Row>
              </Column>
              <Column align="right" grow={false} shrink>
                <Row>
                  <div className="actions">
                    <Button basic onClick={handleClaimENS}>
                      <Icon name="add-active" />
                    </Button>
                  </div>
                </Row>
              </Column>
            </Row>
          </Container>
        </div>
        <Container>
          <Section className="table-section">
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width="2">{t('worlds_list_page.table.name')}</Table.HeaderCell>
                  <Table.HeaderCell width="2">{t('worlds_list_page.table.url')}</Table.HeaderCell>
                  <Table.HeaderCell width="1">{t('worlds_list_page.table.published_scene')}</Table.HeaderCell>
                  <Table.HeaderCell width="1" textAlign="center">
                    {t('worlds_list_page.table.size')}
                  </Table.HeaderCell>
                  <Table.HeaderCell width="1" textAlign="center">
                    {t('worlds_list_page.table.status')}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedItems.map((ens: ENS, index) => {
                  return (
                    <Table.Row className="TableRow" key={index}>
                      <Table.Cell width={2}>{ens.name}</Table.Cell>
                      <Table.Cell width={2}>{renderWorldUrl(ens)}</Table.Cell>
                      <Table.Cell width={1}>{renderPublishSceneButton(ens)}</Table.Cell>
                      <Table.Cell width={1} textAlign="center">
                        {renderWorldSize(ens, worldsWalletStats)}
                      </Table.Cell>
                      <Table.Cell width={1} textAlign="center">
                        {renderWorldStatus(ens)}
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <Pagination
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={(_event, props) => setPage(+props.activePage!)}
              />
            )}
          </Section>
        </Container>
      </>
    )
  }, [
    tab,
    ensList,
    externalNames,
    handleClaimENS,
    paginate,
    renderPublishSceneButton,
    renderSortDropdown,
    renderWorldUrl,
    renderWorldSize,
    renderWorldStatus,
    setPage
  ])

  const renderEmptyPage = useCallback(() => {
    return (
      <Empty className="empty-names-container" height={500}>
        <div className={classNames('empty-icon', tab === TabType.DCL ? 'dcl-icon' : 'ens-icon')} />
        <div className="empty-title">
          {tab === TabType.DCL ? t('worlds_list_page.empty_list.title') : t('worlds_list_page.empty_list.title_ens')}
        </div>
        <div className="empty-description">
          {tab === TabType.DCL
            ? t('worlds_list_page.empty_list.description', { b: (text: string) => <b>{text}</b> })
            : t('worlds_list_page.empty_list.description_ens', { b: (text: string) => <b>{text}</b> })}
        </div>
        <Button className="empty-action" primary onClick={handleClaimENS}>
          {tab === TabType.DCL ? t('worlds_list_page.empty_list.cta') : t('worlds_list_page.empty_list.cta_ens')}
        </Button>
      </Empty>
    )
  }, [tab, handleClaimENS])

  const renderDCLNamesBlockedWorldsStatusMessage = useCallback(() => {
    if (!worldsWalletStats) {
      return null
    }

    const dclWorldsStatus = getDCLWorldsStatus(worldsWalletStats)

    if (dclWorldsStatus.status === DCLWorldsStatus.OK) {
      return null
    }

    let messageContent: ReactNode

    if (dclWorldsStatus.status === DCLWorldsStatus.TO_BE_BLOCKED) {
      messageContent = t('worlds_list_page.worlds_warning_message.to_be_blocked', {
        toBeBlockedAt: dclWorldsStatus.toBeBlockedAt.toLocaleDateString(),
        b: (text: string) => <b>{text}</b>
      })
    } else {
      messageContent = t('worlds_list_page.worlds_warning_message.blocked', {
        blockedAt: dclWorldsStatus.blockedAt.toLocaleDateString(),
        b: (text: string) => <b>{text}</b>
      })
    }

    return (
      <div className="insufficient-storage-message">
        <div>
          <Icon name="alert-warning" />
        </div>
        <div>{messageContent}</div>
      </div>
    )
  }, [worldsWalletStats, getDCLWorldsStatus])

  const renderDCLNamesView = useCallback(() => {
    if (ensList.length) {
      return (
        <div>
          {worldsWalletStats ? (
            <WorldsStorage
              maxBytes={Number(worldsWalletStats.maxAllowedSpace)}
              currentBytes={Number(worldsWalletStats.usedSpace)}
              className="worlds-storage"
              onViewDetails={() => {
                onOpenYourStorageModal({ stats: worldsWalletStats })
              }}
            />
          ) : null}
          {renderDCLNamesBlockedWorldsStatusMessage()}
          {renderList()}
        </div>
      )
    }

    return <div>{renderEmptyPage()}</div>
  }, [ensList, worldsWalletStats, renderList, renderEmptyPage, renderDCLNamesBlockedWorldsStatusMessage, onOpenYourStorageModal])

  const renderENSNamesView = useCallback(() => {
    return <div>{externalNames.length > 0 ? renderList() : renderEmptyPage()}</div>
  }, [externalNames, renderEmptyPage, renderList])

  // Reset values when changing tab.
  useEffect(() => {
    setSortBy(SortBy.ASC)
    setPage(1)
  }, [tab, setPage, setSortBy])

  useEffect(() => {
    if (canOpenWorldsForENSOwnersAnnouncementModal()) {
      onOpenWorldsForENSOwnersAnnouncementModal()
    }
  }, [canOpenWorldsForENSOwnersAnnouncementModal, onOpenWorldsForENSOwnersAnnouncementModal])

  return (
    <LoggedInDetailPage
      className="WorldListPage view"
      error={error}
      activeTab={NavigationTab.WORLDS}
      isLoading={isLoading}
      isPageFullscreen={true}
    >
      <Container>
        <h1>Worlds</h1>
        <NameTabs />
        {tab === TabType.DCL ? renderDCLNamesView() : renderENSNamesView()}
      </Container>
    </LoggedInDetailPage>
  )
}

export default React.memo(WorldListPage)
