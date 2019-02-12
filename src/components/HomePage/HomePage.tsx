import * as React from 'react'
import { Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-projects">
              <div>{t('homepage.empty_projects_title')}</div>
              <small>{t('homepage.empty_projects_cta')}</small>
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
