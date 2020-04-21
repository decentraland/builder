import React from 'react'
import Navbar from 'components/Navbar'
import { Page, Button, Header } from 'decentraland-ui'
import Footer from 'components/Footer'
import { builder } from 'lib/api/builder'
import { Props, State } from './MigratePage.types'
import './MigratePage.css'

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
          Migrate your account
        </Header>
        <div className="message">
          <p>
            In order to provide a seemless experience across our products, we have switched the Builder's account system from email to
            wallet based. This means that you will need to connect an Ethereum wallet to store your scenes in the Cloud. If you don't have a
            wallet you can learn more about how to get one{' '}
            <a href="https://docs.decentraland.org/examples/get-a-wallet/" target="_blank">
              here
            </a>
            .
          </p>
          <p>If you had scenes stored in your email account, you can migrate them to your wallet account using this page.</p>
        </div>
        <Button primary onClick={this.handleStart}>
          Start Migration
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
          Login with your email
        </Header>
        <div className="message">
          <p>Please login with your email account to find the scenes that need to be migrated.</p>
        </div>
        <Button primary onClick={() => onLegacyLogin()}>
          Login
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
            Connect your wallet
          </Header>
          <div className="message">
            <p>
              Please connect your wallet to continue. If you don't have a wallet here's a{' '}
              <a href="https://docs.decentraland.org/examples/get-a-wallet/" target="_blank">
                beginners guide
              </a>{' '}
              to get one.
            </p>
          </div>
          <Button primary onClick={() => onLogin()}>
            Connect
          </Button>
          {error ? (
            <div className="error">
              Please install{' '}
              <a href="https://metamask.io" target="_blank" rel="no:opener no:referrer">
                MetaMask
              </a>{' '}
              or other web3 wallet to continue.
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
            Migrate your scenes
          </Header>
          <div className="message">
            <p>Migrate all scenes and asset packs under your email account into your wallet account.</p>
          </div>
          <Button primary disabled={isMigrating} onClick={() => onMigrate()}>
            Migrate
          </Button>
        </div>
        {this.renderProjects()}
      </>
    )
  }

  renderProjects() {
    return (
      <>
        <Header className="projects-title">The following projects will be migrated:</Header>
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
        <Navbar />
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
