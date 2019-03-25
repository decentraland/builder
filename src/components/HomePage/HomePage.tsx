import * as React from 'react'
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
    if (template.custom) {
      this.props.onOpenModal('CustomLayoutModal')
    } else {
      this.props.onCreateProject(template)
    }
  }

  handleWatchVideo = () => {
    this.props.onOpenModal('VideoModal')
  }

  render() {
    const projects = Object.values(this.props.projects)
    const templates = getTemplates()
    return (
      <div className="HomePage">
        {projects.length > 0 && (
          <div className="project-cards">
            <div className="subtitle">{t('home_page.projects_title')}</div>
            <div className="CardList">
              {projects
                .sort(project => -project.createdAt)
                .map((project, index) => (
                  <ProjectCard key={index} project={project} />
                ))}
            </div>
          </div>
        )}

        <div id="template-cards" className="template-cards">
          <div className="subtitle">{t('home_page.templates_title')}</div>
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
    )
  }
}
