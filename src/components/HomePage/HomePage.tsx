import * as React from 'react'
import { Header } from 'decentraland-ui'
import App from 'decentraland-dapps/dist/containers/App'

import ProjectList from './ProjectList/ProjectList'
import * as languages from 'modules/translation/languages'
import getTemplates from 'modules/project/utils'

import { Props } from './HomePage.types'
import './HomePage.css'
import { BaseProject } from 'modules/project/types'

export default class HomePage extends React.PureComponent<Props> {
  static defaultProps = {
    projects: {}
  }

  handleProjectClick = (project: BaseProject) => {
    console.log('HELLO', project)
    this.props.onProjectClick(project.id)
  }

  handleTemplateClick = (project: BaseProject) => {
    console.log('Template', project)
  }

  render() {
    const { projects } = this.props
    const templates = getTemplates()

    return (
      <div className="HomePage">
        <App activePage="builder" locales={Object.keys(languages)}>
          <Header size="large">Build something cool!</Header>
          <p className="subtitle">Import a file or start from scratch with our templates or your own LAND!</p>

          <div className="project-cards">
            <div className="subtitle">PROJECTS</div>
            <ProjectList projects={Object.values(projects)} onClick={this.handleProjectClick} />
          </div>

          <div className="project-cards">
            <div className="subtitle">TEMPLATES</div>
            <ProjectList projects={templates} onClick={this.handleTemplateClick} />
          </div>
        </App>
      </div>
    )
  }
}
