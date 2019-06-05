import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Container, Button } from 'decentraland-ui'

import HomePageBanner from 'components/Banners/HomePageBanner'
import HomePageHero from 'components/HomePageHero'
import ProjectCard from 'components/ProjectCard'
import TemplateCard from 'components/TemplateCard'
import { getTemplates } from 'modules/template/utils'
import { Template } from 'modules/template/types'
import Icon from 'components/Icon'
import PromoBanner from './PromoBanner'
import { Props, State, DefaultProps } from './HomePage.types'
import './HomePage.css'

const ethereum = (window as any)['ethereum']

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
    this.props.onOpenModal('AdBlockModal', { origin: 'HomePage Promo CTA' })
  }

  handleBannerCTA = () => {
    this.props.onOpenModal('AdBlockModal', { origin: 'HomePage CTA' })
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
    const { isAnimationPlaying } = this.state
    const projects = Object.values(this.props.projects)
    const templates = getTemplates()
    const shouldRenderPromo = ethereum && !ethereum.isDapper
    return (
      <>
        {!projects.length ? (
          <>
            <HomePageHero onWatchVideo={this.handleWatchVideo} onStart={this.handleStart} />
            <HomePageBanner onClick={this.handleBannerCTA} />
          </>
        ) : (
          <Container>{shouldRenderPromo && <PromoBanner onClick={this.handlePromoCTA} />}</Container>
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
                    .sort(project => -project.createdAt)
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
      </>
    )
  }
}
