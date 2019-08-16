import * as React from 'react'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { env } from 'decentraland-commons'
import { Container, Button, Page, Dropdown, DropdownProps, Pagination, PaginationProps } from 'decentraland-ui'

import HomePageHero from 'components/HomePageHero'
import ProjectCard from 'components/ProjectCard'
import TemplateCard from 'components/TemplateCard'
import { getTemplates } from 'modules/template/utils'
import { Template } from 'modules/template/types'
import Icon from 'components/Icon'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import LoadingPage from 'components/LoadingPage'
import PromoBanner from './PromoBanner'
import SyncToast from 'components/SyncToast'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/locations'
import { Props, State, DefaultProps } from './HomePage.types'
import './HomePage.css'

const PROMO_URL = env.get('REACT_APP_PROMO_URL')

export default class HomePage extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    projects: []
  }

  state = {
    isAnimationPlaying: false
  }

  handleTemplateClick = (template: Template) => {
    if (template.custom) {
      this.props.onOpenModal('CustomLayoutModal')
    } else {
      this.props.onCreateProject(template)
    }
  }

  handleStart = () => {
    this.setState({ isAnimationPlaying: true })
    document.getElementById('template-cards')!.scrollIntoView()
    setTimeout(() => {
      this.setState({ isAnimationPlaying: false })
    }, 2000)
  }

  handleWatchVideo = () => {
    this.props.onOpenModal('VideoModal')
  }

  handleOpenImportModal = () => {
    this.props.onOpenModal('ImportModal')
  }

  handlePromoCTA = () => {
    if (PROMO_URL) {
      window.open(`${PROMO_URL}?utm_source=builder&utm_campaign=homepage`)
    }
  }

  renderImportButton = () => {
    return (
      <Button basic className="import-scene" onClick={this.handleOpenImportModal}>
        <Icon name="import" />
        {t('home_page.import_scene')}
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
    const { isLoggedIn, didSync, projects } = this.props

    if (projects.length > 0) {
      return projects.map((project, index) => <ProjectCard key={index} project={project} />)
    } else if (!isLoggedIn && didSync) {
      return (
        <div className="empty-projects">
          {' '}
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
      )
    }
    return (
      <div className="empty-projects">
        <T id="home_page.no_projects" values={{ br: <br /> }} />
      </div>
    )
  }

  handleLogin = () => {
    this.props.onLogin()
  }

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
    const { projects, isFetching, totalPages, page, didCreate, didSync, isLoggedIn } = this.props
    if (isFetching) {
      return <LoadingPage />
    }
    const { isAnimationPlaying } = this.state
    const templates = getTemplates()
    const showDashboard = isLoggedIn || didCreate || didSync || projects.length > 0
    const hasPagination = totalPages > 1

    return (
      <>
        <Navbar isFullscreen isOverlay={!showDashboard} />
        <Page isFullscreen>
          {!showDashboard ? (
            <HomePageHero onWatchVideo={this.handleWatchVideo} onStart={this.handleStart} />
          ) : (
            <Container>{<PromoBanner onClick={this.handlePromoCTA} />}</Container>
          )}
          <Container>
            <div className="HomePage">
              {showDashboard && (
                <div className={`project-cards ${hasPagination ? 'has-pagination' : ''}`}>
                  <SyncToast />
                  <div className="subtitle">
                    {t('home_page.projects_title')}
                    <div className="menu">
                      {projects.length > 1 ? this.renderSortDropdown() : null}
                      {this.renderImportButton()}
                    </div>
                  </div>
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
                </div>
              )}
              <div id="template-cards" className={'template-cards' + (isAnimationPlaying ? ' animate' : '')}>
                <div className="subtitle">
                  {t('home_page.templates_title')}
                  {!showDashboard && this.renderImportButton()}
                </div>
                <div className="template-list">
                  <div className="template-row">
                    <TemplateCard template={templates[0]} onClick={this.handleTemplateClick} />
                    <TemplateCard template={templates[1]} onClick={this.handleTemplateClick} />
                  </div>
                  <div className="template-row">
                    <TemplateCard template={templates[2]} onClick={this.handleTemplateClick} />
                    <TemplateCard template={templates[3]} onClick={this.handleTemplateClick} />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Page>
        <Footer />
      </>
    )
  }
}
