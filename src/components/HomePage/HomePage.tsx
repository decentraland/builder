import * as React from 'react'
import { Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import ProjectCard from 'components/ProjectCard'
import TemplateCard from 'components/TemplateCard'
import { getTemplates } from 'modules/template/utils'
import { Project } from 'modules/project/types'
import { Template } from 'modules/template/types'

import { Props } from './HomePage.types'
import './HomePage.css'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps = {
    projects: {}
  }

  handleProjectClick = (project: Project) => {
    this.props.onProjectClick(project.id)
  }

  handleTemplateClick = (template: Template) => {
    this.props.onCreateProject(template)
  }

  render() {
    const projects = Object.values(this.props.projects)
    const templates = getTemplates()

    return (
      <div className="HomePage">
        <Header size="large">{t('homepage.title')}</Header>
        <p className="subtitle">{t('homepage.subtitle')}</p>

        <div className="project-cards">
          <div className="subtitle">{t('global.projects').toUpperCase()}</div>
          {projects.length > 0 ? (
            <div className="CardList">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} onClick={this.handleProjectClick} />
              ))}
            </div>
          ) : (
            <div className="empty-projects">
              <div>Here's where your projects will live</div>
              <small>Select a template below to start building awesome stuff!</small>
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
