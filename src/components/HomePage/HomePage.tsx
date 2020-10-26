import * as React from 'react'
import { Link } from 'react-router-dom'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import {
  Container,
  Button,
  Page,
  Dropdown,
  DropdownProps,
  Pagination,
  PaginationProps,
  Tabs,
  Row,
  Header,
  Icon,
  Section
} from 'decentraland-ui'

import BuilderIcon from 'components/Icon'
import ProjectCard from 'components/ProjectCard'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'
import SyncToast from 'components/SyncToast'
import { SortBy } from 'modules/ui/dashboard/types'
import { locations } from 'routing/locations'
import { PaginationOptions } from 'routing/utils'
import { Props, DefaultProps } from './HomePage.types'
import TopBanner from './TopBanner'
import './HomePage.css'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    projects: []
  }

  componentWillMount() {
    const { onLoadFromScenePool } = this.props
    onLoadFromScenePool({ sortBy: 'updated_at', sortOrder: 'desc' })
  }

  handleOpenImportModal = () => {
    this.props.onOpenModal('ImportModal')
  }

  handleOpenCreateModal = () => {
    this.props.onOpenModal('CustomLayoutModal')
  }

  renderImportButton = () => {
    return (
      <Button basic className="import-scene" onClick={this.handleOpenImportModal}>
        <BuilderIcon name="import" />
      </Button>
    )
  }

  renderCreateButton = () => {
    return (
      <Button basic className="create-scene" onClick={this.handleOpenCreateModal}>
        <BuilderIcon name="add-active" />
      </Button>
    )
  }

  renderSortDropdown = () => {
    const { sortBy } = this.props
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.NEWEST, text: t('home_page.sort.newest') },
          { value: SortBy.NAME, text: t('home_page.sort.name') },
          { value: SortBy.SIZE, text: t('home_page.sort.size') }
        ]}
        onChange={this.handleDropdownChange}
      />
    )
  }

  renderProjects = () => {
    const { isLoggedIn, didSync, projects, didMigrate, needsMigration } = this.props

    if (projects.length > 0) {
      return projects.map(project => <ProjectCard key={project.id} project={project} />)
    } else if (!isLoggedIn && didSync) {
      return (
        <div className="empty-projects">
          {needsMigration && !didMigrate ? (
            <div>
              <T
                id="home_page.migration"
                values={{
                  link: <Link to={locations.migrate()}>{t('home_page.migration_link')}</Link>
                }}
              />
            </div>
          ) : (
            <div>
              <T
                id="home_page.no_projects_guest"
                values={{
                  br: <br />,
                  sign_in: (
                    <a href="#" onClick={this.handleLogin}>
                      {t('user_menu.sign_in')}
                    </a>
                  )
                }}
              />
            </div>
          )}
        </div>
      )
    }
    return (
      <div className="empty-projects">
        {needsMigration && !didMigrate ? (
          <div>
            <T
              id="home_page.migration"
              values={{
                link: <Link to={locations.migrate()}>{t('home_page.migration_link')}</Link>
              }}
            />
          </div>
        ) : (
          <div>
            <T
              id="home_page.no_projects"
              values={{
                br: <br />,
                link: (
                  <a
                    href="#"
                    onClick={event => {
                      event.preventDefault()
                      this.handleOpenCreateModal()
                    }}
                  >
                    {t('global.click_here')}
                  </a>
                )
              }}
            />
          </div>
        )}
      </div>
    )
  }

  handleLogin = () => {
    this.props.onLogin()
  }

  handleOpenShowcase = () => this.props.onNavigate(locations.poolSearch())

  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  handleNavigateToNames = () => this.props.onNavigate(locations.names())

  handleDropdownChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) =>
    this.paginate({ sortBy: value as SortBy })

  handlePageChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { activePage }: PaginationProps) =>
    this.paginate({ page: activePage as number })

  paginate = (options: PaginationOptions = {}) => {
    const { page, sortBy } = this.props
    this.props.onPageChange({
      page,
      sortBy,
      ...options
    })
  }

  render() {
    const { projects, isFetching, totalPages, page, needsMigration, didMigrate, isLoggingIn, poolList } = this.props
    if (isLoggingIn || isFetching) {
      return <LoadingPage />
    }

    const hasPagination = totalPages > 1

    return (
      <>
        {needsMigration && !didMigrate ? <TopBanner /> : null}
        <Navbar isFullscreen />
        <Page isFullscreen className="HomePage">
          <Tabs>
            <SyncToast />
            <Tabs.Tab active>{t('navigation.scenes')}</Tabs.Tab>
            <Tabs.Tab onClick={this.handleNavigateToLand}>{t('navigation.land')}</Tabs.Tab>
            <Tabs.Tab onClick={this.handleNavigateToNames}>{t('navigation.names')}</Tabs.Tab>
          </Tabs>
          <Container>
            <div className="projects-menu">
              <div className="items-count">{t('home_page.results', { count: projects.length })}</div>
              <div className="actions">
                {projects.length > 1 ? this.renderSortDropdown() : null}
                {this.renderImportButton()}
                {this.renderCreateButton()}
              </div>
            </div>
            <Section className={`project-cards ${hasPagination ? 'has-pagination' : ''}`}>
              <div className="CardList">{this.renderProjects()}</div>
              {hasPagination ? (
                <Pagination
                  firstItem={null}
                  lastItem={null}
                  activePage={page}
                  totalPages={totalPages}
                  onPageChange={this.handlePageChange}
                />
              ) : null}
            </Section>
            {poolList ? (
              <>
                <Row>
                  <Row className="scene-pool-menu">
                    <Header sub>{t('home_page.from_scene_pool')}</Header>
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
        </Page>
        <Footer />
      </>
    )
  }
}
