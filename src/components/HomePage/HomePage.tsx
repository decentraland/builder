import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { env } from 'decentraland-commons'
import { Container, Button, Page } from 'decentraland-ui'

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
import { Props, State, DefaultProps } from './HomePage.types'
import './HomePage.css'

const PROMO_URL = env.get('REACT_APP_PROMO_URL')

export default class HomePage extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    projects: {}
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

  render() {
    const { isFetching } = this.props
    if (isFetching) {
      return <LoadingPage />
    }
    const { isAnimationPlaying } = this.state
    const projects = Object.values(this.props.projects)
    const templates = getTemplates()

    return (
      <>
        <Navbar isFullscreen isOverlay={projects.length === 0} />
        <Page isFullscreen>
          {!projects.length ? (
            <>
              <HomePageHero onWatchVideo={this.handleWatchVideo} onStart={this.handleStart} />
            </>
          ) : (
            <Container>{<PromoBanner onClick={this.handlePromoCTA} />}</Container>
          )}
          <Container>
            <div className="HomePage">
              {projects.length > 0 && (
                <div className="project-cards">
                  <div className="subtitle">
                    {t('home_page.projects_title')}
                    {this.renderImportButton()}
                  </div>
                  <div className="CardList">
                    {projects
                      .sort(project => -new Date(project.createdAt))
                      .map((project, index) => (
                        <ProjectCard key={index} project={project} />
                      ))}
                  </div>
                </div>
              )}

              <div id="template-cards" className={'template-cards' + (isAnimationPlaying ? ' animate' : '')}>
                <div className="subtitle">
                  {t('home_page.templates_title')}
                  {!projects.length && this.renderImportButton()}
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
