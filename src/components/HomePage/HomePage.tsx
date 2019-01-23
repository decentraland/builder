import * as React from 'react'
import { Header } from 'decentraland-ui'
import App from 'decentraland-dapps/dist/containers/App'

import ProjectCard from 'components/ProjectCard'
import TemplateCard from 'components/TemplateCard'
import * as languages from 'modules/translation/languages'
import getTemplates from 'modules/template/utils'
import { Project } from 'modules/project/types'
import { Template } from 'modules/template/types'

import { Props } from './HomePage.types'
import './HomePage.css'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps = {
    projects: {}
  }

  handleProjectClick = (project: Project) => {
    console.log('HELLO', project)
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
        <App activePage="builder" locales={Object.keys(languages)}>
          <Header size="large">Build something cool!</Header>
          <p className="subtitle">Import a file or start from scratch with our templates or your own LAND!</p>

          {projects.length > 0 ? (
            <div className="project-cards">
              <div className="subtitle">PROJECTS</div>
              <div className="CardList">
                {projects.map((project, index) => (
                  <ProjectCard key={index} project={project} onClick={this.handleProjectClick} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="project-cards">
            <div className="subtitle">TEMPLATES</div>
            <div className="CardList">
              {templates.map((template, index) => (
                <TemplateCard key={index} template={template} onClick={this.handleTemplateClick} />
              ))}
            </div>
          </div>
        </App>
      </div>
    )
  }
}
