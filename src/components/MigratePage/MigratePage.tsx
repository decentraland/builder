import React from 'react'
import Navbar from 'components/Navbar'
import { Page, Button, Header } from 'decentraland-ui'
import Footer from 'components/Footer'
import { builder } from 'lib/api/builder'
import { Props, State } from './MigratePage.types'
import './MigratePage.css'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

const LOCAL_STORAGE_KEY = 'auth0_migration_started'

export default class MigratePage extends React.PureComponent<Props, State> {
  state: State = {
    projects: [],
    isLoading: false,
    hasStarted: !!localStorage.getItem(LOCAL_STORAGE_KEY),
    error: null
  }

  async UNSAFE_componentWillMount() {
    await this.fetchProjects()
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.error && !this.state.error) {
      this.setState({
        error: nextProps.error
      })
    } else if (!nextProps.error && this.state.error) {
      this.setState({
        error: null
      })
    } else if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      this.fetchProjects().catch()
    }
  }

  async fetchProjects() {
    const { isLegacyLoggedIn } = this.props
    if (!isLegacyLoggedIn) return
    this.setState({ isLoading: true })
    const projects = await builder.fetchProjectsToMigrate()
    this.setState({ projects, isLoading: false })
  }

  handleStart = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
    this.setState({ hasStarted: true })
  }

  renderStart() {
    return (
      <div className="step">
        <div className="icon-wrapper">
          <div className="migrate-account icon" />
        </div>
        <Header className="title" size="large">
          {t('migrate_page.step_one_title')}
        </Header>
        <div className="message">
          <p>
            <T
              id="migrate_page.step_one_message_line_one"
              values={{
                link: (
                  <a href="https://docs.decentraland.org/examples/get-a-wallet/" target="_blank">
                    {t('migrate_page.step_one_link')}
                  </a>
                )
              }}
            />
          </p>
          <p>{t('migrate_page.step_one_message_line_two')}</p>
        </div>
        <Button primary onClick={this.handleStart}>
          {t('migrate_page.step_one_cta')}
        </Button>
      </div>
    )
  }

  renderLegacyLogin() {
    const { onLegacyLogin } = this.props
    return (
      <div className="step">
        <div className="icon-wrapper">
          <div className="email icon" />
        </div>
        <Header className="title" size="large">
          {t('migrate_page.step_two_title')}
        </Header>
        <div className="message">
          <p>{t('migrate_page.step_two_message')}</p>
        </div>
        <Button primary onClick={() => onLegacyLogin()}>
          {t('migrate_page.step_two_cta')}
        </Button>
      </div>
    )
  }

  renderLogin() {
    const { onLogin } = this.props
    const { error } = this.state
    return (
      <>
        <div className="step">
          <div className="icon-wrapper">
            <div className="wallet icon" />
          </div>
          <Header className="title" size="large">
            {t('migrate_page.step_three_title')}
          </Header>
          <div className="message">
            <p>
              <T
                id="migrate_page.step_three_message"
                values={{
                  link: (
                    <a href="https://docs.decentraland.org/examples/get-a-wallet/" target="_blank">
                      {t('migrate_page.step_three_link')}
                    </a>
                  )
                }}
              />
            </p>
          </div>
          <Button primary onClick={() => onLogin()}>
            {t('migrate_page.step_three_cta')}
          </Button>
          {error ? (
            <div className="error">
              <T
                id="migrate_page.step_three_error"
                values={{
                  metamask: (
                    <a href="https://metamask.io" target="_blank" rel="no:opener no:referrer">
                      MetaMask
                    </a>
                  )
                }}
              />
            </div>
          ) : null}
        </div>
        {this.renderProjects()}
      </>
    )
  }

  renderMigrate() {
    const { onMigrate, isMigrating } = this.props
    return (
      <>
        <div className="step">
          <div className="icon-wrapper">
            <div className="migrate-account icon" />
          </div>
          <Header className="title" size="large">
            {t('migrate_page.step_four_title')}
          </Header>
          <div className="message">
            <p>{t('migrate_page.step_four_message')}</p>
          </div>
          <Button primary disabled={isMigrating} onClick={() => onMigrate()}>
            {t('migrate_page.step_four_cta')}
          </Button>
        </div>
        {this.renderProjects()}
      </>
    )
  }

  renderProjects() {
    return (
      <>
        <Header className="projects-title"> {t('migrate_page.projects_title')}</Header>
        <div className="projects">
          {this.state.projects.map(project => (
            <div className="project">
              <div className="title">{project.title}</div>
              <div className="image" style={{ backgroundImage: `url(${project.thumbnail})` }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  render() {
    const { isLoggedIn, isLegacyLoggedIn } = this.props
    const { hasStarted } = this.state
    return (
      <>
        <Navbar onSignIn={undefined} />
        <Page className="MigratePage">
          {!hasStarted ? this.renderStart() : null}
          {hasStarted && !isLegacyLoggedIn ? this.renderLegacyLogin() : null}
          {hasStarted && isLegacyLoggedIn && !isLoggedIn ? this.renderLogin() : null}
          {hasStarted && isLoggedIn && isLegacyLoggedIn ? this.renderMigrate() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
