import * as React from 'react'
import { Header, Button } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectCard from 'components/ProjectCard'
import TemplateCard from 'components/TemplateCard'
import { getTemplates } from 'modules/template/utils'
import { Template } from 'modules/template/types'
import { Props, DefaultProps } from './HomePage.types'

import './HomePage.css'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    projects: {}
  }

  handleTemplateClick = (template: Template) => {
    if (template.custom) {
      this.props.onOpenModal('CustomLayoutModal')
    } else {
      this.props.onCreateProject(template)
    }
  }

  handleWatchVideo = () => {
    this.props.onOpenModal('VideoModal')
  }

  renderBanner() {
    return (
      <div className="banner">
        <Header size="large" className="banner-title">
          {t('contest.banner.title')}
        </Header>
        <div className="banner-text">
          <T
            id="contest.banner.text"
            values={{
              mana: <span className="highlight">{t('contest.mana')}</span>,
              land: <span className="highlight">{t('contest.land')}</span>,
              usd: <span className="highlight">{t('contest.usd')}</span>,
              br: <br />
            }}
          />
        </div>
        <Button className="banner-cta" onClick={this.handleWatchVideo}>
          {t('contest.banner.cta')}
        </Button>
      </div>
    )
  }

  render() {
    const projects = Object.values(this.props.projects)
    const templates = getTemplates()
    return (
      <div className="HomePage">
        <Header size="large">{t('home_page.title')}</Header>
        <p className="subtitle">{t('home_page.subtitle')}</p>
        {this.renderBanner()}
        <div className="project-cards">
          <div className="subtitle">{t('global.projects').toUpperCase()}</div>
          {projects.length > 0 ? (
            <div className="CardList">
              {projects
                .sort(project => -project.createdAt)
                .map((project, index) => (
                  <ProjectCard key={index} project={project} />
                ))}
            </div>
          ) : (
            <div className="empty-projects">
              <div>{t('home_page.empty_projects_title')}</div>
              <small>{t('home_page.empty_projects_cta')}</small>
            </div>
          )}
        </div>

        <div className="project-cards">
          <div className="subtitle">{t('global.templates').toUpperCase()}</div>
          <div className="CardList">
            {templates.map((template, index) => (
              <TemplateCard key={index} template={template} onClick={this.handleTemplateClick} />
            ))}
          </div>
        </div>
      </div>
    )
  }
}
