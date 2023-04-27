import React, { useCallback, useState } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Button, Table, Row, Column, Header, Section, Container, Pagination, Dropdown, Empty, Icon as DCLIcon } from 'decentraland-ui'
import { config } from 'config'
import { ENS } from 'modules/ens/types'
import { locations } from 'routing/locations'
import { preventDefault } from 'lib/preventDefault'
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard'
import Icon from 'components/Icon'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Props, SortBy } from './WorldListPage.types'
import './WorldListPage.css'

const EXPLORER_URL = config.get('EXPLORER_URL', '')
const PAGE_SIZE = 12

const WorldListPage: React.FC<Props> = props => {
  const { ensList, error, deploymentsByWorlds, isLoading, onNavigate } = props
  const [sortBy, setSortBy] = useState(SortBy.ASC)
  const [page, setPage] = useState(1)

  const isWorldDeployed = (ens: ENS) => ens.worldStatus?.healthy === true

  const handleClaimENS = useCallback(() => {
    onNavigate(locations.claimENS())
  }, [onNavigate])

  const handlePublishScene = useCallback(() => {
    onNavigate(locations.scenes())
  }, [onNavigate])

  const handleEditScene = (ens: ENS) => {
    const { projectId } = deploymentsByWorlds[ens.subdomain]
    onNavigate(locations.sceneDetail(projectId as string))
  }

  const renderSortDropdown = () => {
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
  }

  const paginate = () => {
    return ensList
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
  }

  const renderWorldUrl = (ens: ENS) => {
    const url = `${EXPLORER_URL}/world/${ens.name}`
    return isWorldDeployed(ens) ? (
      <div className="world-url">
        <span>{url}</span>
        <div className="right">
          <CopyToClipboard role="button" text={url}>
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
  }

  const renderWorldStatus = (ens: ENS) => {
    return isWorldDeployed(ens) ? (
      <span className="world-status active">
        <DCLIcon name="check" />
        {t('worlds_list_page.table.status_active')}
      </span>
    ) : (
      <span className="world-status inactive">{t('worlds_list_page.table.status_inactive')}</span>
    )
  }

  const renderPublishSceneButton = (ens: ENS) => {
    return isWorldDeployed(ens) ? (
      <div className="publish-scene">
        <span>{deploymentsByWorlds[ens.subdomain]?.name}</span>
        <Button inverted size="small" onClick={() => handleEditScene(ens)}>
          {t('worlds_list_page.table.edit_scene')}
        </Button>
      </div>
    ) : (
      <div className="publish-scene">
        <span>-</span>
        <Button primary size="small" onClick={handlePublishScene}>
          {t('worlds_list_page.table.publish_scene')}
        </Button>
      </div>
    )
  }

  const renderActionsMenu = () => {
    return (
      <div>
        <Dropdown
          trigger={
            <Button basic>
              <DCLIcon name="ellipsis horizontal" />
            </Button>
          }
          inline
          direction="left"
          onClick={() => preventDefault()}
        >
          <Dropdown.Menu>
            <Dropdown.Item text={'TBD'} />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  const renderEnsList = () => {
    const total = ensList.length
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
                    {t('ens_list_page.items', { count: ensList.length.toLocaleString() })}
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
                    {t('worlds_list_page.table.status')}
                  </Table.HeaderCell>
                  <Table.HeaderCell width="1"></Table.HeaderCell>
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
                        {renderWorldStatus(ens)}
                      </Table.Cell>
                      <Table.Cell width={1}>{renderActionsMenu()}</Table.Cell>
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
  }

  const renderEmptyPage = () => {
    return (
      <Empty className="empty-names-container" height={500}>
        <div className="empty-icon">
          <DCLIcon name="address card outline" />
        </div>
        <div className="empty-title">{t('worlds_list_page.empty_list.title')}</div>
        <div className="empty-description">{t('worlds_list_page.empty_list.description', { b: (text: string) => <b>{text}</b> })}</div>
        <Button className="empty-action" primary onClick={handleClaimENS}>
          {t('worlds_list_page.empty_list.cta')}
        </Button>
      </Empty>
    )
  }

  return (
    <LoggedInDetailPage
      className="WorldListPage view"
      error={error}
      activeTab={NavigationTab.WORLDS}
      isLoading={isLoading}
      isPageFullscreen={true}
    >
      {ensList.length > 0 ? renderEnsList() : renderEmptyPage()}
    </LoggedInDetailPage>
  )
}

export default React.memo(WorldListPage)
