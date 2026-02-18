import React, { useCallback, useEffect } from 'react'
import classNames from 'classnames'
import { Link, useHistory } from 'react-router-dom'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import {
  Container,
  Button,
  Dropdown,
  DropdownProps,
  Pagination,
  PaginationProps,
  Row,
  Header,
  Icon,
  Section,
  Column
} from 'decentraland-ui'

import ProjectCard from 'components/ProjectCard'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import LoadingPage from 'components/LoadingPage'
import SyncToast from 'components/SyncToast'
import { SortBy } from 'modules/ui/dashboard/types'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import SceneCreationSelector from 'components/SceneCreationSelector'
import { locations } from 'routing/locations'
import { PaginationOptions } from 'routing/utils'
import { Props, DefaultProps } from './ScenesPage.types'
import './ScenesPage.css'

const ScenesPage: React.FC<Props> = props => {
  const { page, poolList, projects, sortBy, totalPages, isFetching, isLoggingIn, onLoadFromScenePool, onOpenModal } = props
  const history = useHistory()

  useEffect(() => {
    onLoadFromScenePool({ sortBy: 'updated_at', sortOrder: 'desc' })
  }, [onLoadFromScenePool])

  useEffect(() => {
    if (!isFetching) {
      onOpenModal('CreatorHubUpgradeModal')
    }
  }, [onOpenModal, isFetching])

  const handleOpenImportModal = useCallback(() => {
    onOpenModal('ImportModal')
  }, [onOpenModal])

  const handleOpenCreateModal = useCallback(() => {
    onOpenModal('SceneCreationModal')
  }, [onOpenModal])

  const renderImportButton = () => {
    return (
      <Button inverted className="import-scene" onClick={handleOpenImportModal}>
        {t('scenes_page.upload_scene')}
      </Button>
    )
  }

  const renderCreateButton = () => {
    return (
      <Button primary className="create-scene" onClick={handleOpenCreateModal}>
        {t('scenes_page.create_scene')}
      </Button>
    )
  }

  const renderSortDropdown = () => {
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.NEWEST, text: t('scenes_page.sort.newest') },
          { value: SortBy.NAME, text: t('scenes_page.sort.name') },
          { value: SortBy.SIZE, text: t('scenes_page.sort.size') }
        ]}
        onChange={handleDropdownChange}
      />
    )
  }

  const renderProjects = () => {
    if (projects.length > 0) {
      return (
        <div className="CardList">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )
    }

    return (
      <div className="no-scenes-container">
        <h3 className="no-scenes-title">{t('scenes_page.no_scenes.title')}</h3>
        <span className="no-scenes-description">
          {t('scenes_page.no_scenes.description', {
            a: (content: string) => (
              <a rel="noreferrer" target="_blank" href="https://docs.decentraland.org/creator/development-guide/sdk-101/">
                {content}
              </a>
            )
          })}
        </span>
        <SceneCreationSelector />
      </div>
    )
  }

  const paginate = useCallback(
    (options: PaginationOptions = {}) => {
      history.push(
        locations.scenes({
          page,
          sortBy,
          ...options
        })
      )
    },
    [page, sortBy, history]
  )

  const handleDropdownChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => paginate({ sortBy: value as SortBy }),
    [paginate]
  )

  const handlePageChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, { activePage }: PaginationProps) => paginate({ page: activePage as number }),
    [paginate]
  )

  if (isLoggingIn || isFetching) {
    return <LoadingPage />
  }

  const hasPagination = totalPages > 1

  const paginationProps: Record<string, any> = {
    firstItem: null,
    lastItem: null
  }

  if (page === 1) {
    paginationProps.prevItem = null
  }
  if (page === totalPages) {
    paginationProps.nextItem = null
  }

  const render = () => {
    return (
      <>
        <SyncToast />
        <Container>
          <Section className="projects-menu">
            <Row>
              <Column>
                <Header>{t('scenes_page.my_scenes')}</Header>
              </Column>
              <Column align="right">
                <div className="actions">
                  {renderImportButton()}
                  {renderCreateButton()}
                </div>
              </Column>
            </Row>
            <Row className="actions">
              <Column>
                <div className="items-count">{t('scenes_page.results', { count: projects.length })}</div>
              </Column>
              <Column align="right">{projects.length > 1 ? renderSortDropdown() : null}</Column>
            </Row>
          </Section>
          <Section className={classNames('project-cards', { 'has-pagination': hasPagination })}>
            {renderProjects()}
            {hasPagination ? (
              <Pagination {...paginationProps} activePage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            ) : null}
          </Section>
          {poolList ? (
            <>
              <Row>
                <Row className="scene-pool-menu">
                  <Header sub>{t('scenes_page.from_scene_pool')}</Header>
                </Row>
                <Row align="right">
                  <Link to={locations.poolSearch()}>
                    <Button basic>
                      {t('global.view_more')}&nbsp;<Icon name="chevron right"></Icon>
                    </Button>
                  </Link>
                </Row>
              </Row>
              <div className="scene-pool-projects">
                {poolList.map(pool => (
                  <ProjectCard key={pool.id} project={pool} />
                ))}
              </div>
            </>
          ) : null}
        </Container>
      </>
    )
  }

  return (
    <LoggedInDetailPage className="ScenesPage" activeTab={NavigationTab.SCENES}>
      {render()}
    </LoggedInDetailPage>
  )
}

ScenesPage.defaultProps = {
  projects: []
} as DefaultProps

export default ScenesPage
