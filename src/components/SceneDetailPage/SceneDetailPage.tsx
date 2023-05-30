import React, { useCallback } from 'react'
import { Props } from './SceneDetailPage.types'
import { Page, Center, Loader, Section, Row, Column, Header, Button, Dropdown, Icon, Empty, Badge } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Deployment, DeploymentStatus } from 'modules/deployment/types'
import { getStatus } from 'modules/deployment/utils'
import { Project } from 'modules/project/types'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import Back from 'components/Back'
import NotFound from 'components/NotFound'
import DeploymentDetail from './DeploymentDetail'
import './SceneDetailPage.css'

const SceneDetailPage: React.FC<Props> = props => {
  const { project, isLoading, deployments, onOpenModal } = props

  const renderLoading = () => {
    return (
      <Center>
        <Loader active size="large" />
      </Center>
    )
  }

  const renderNotFound = () => {
    return <NotFound />
  }

  const handleEditClick = useCallback(() => {
    onOpenModal('EditProjectModal')
  }, [onOpenModal])

  const getSceneStatus = () => {
    const { project, deployments, isLoading, isLoadingDeployments } = props

    if (isLoading || isLoadingDeployments) {
      return null
    }

    if (deployments.length === 0) {
      return (
        <Badge className="status-badge" color="#FFBC5B">
          {t('scene_detail_page.draft')}
        </Badge>
      )
    }

    let statusText = t('scene_detail_page.published')
    let badgeColor = '#34CE76'
    for (const deployment of deployments) {
      if (deployment.projectId === (project as Project).id) {
        if (DeploymentStatus.NEEDS_SYNC === getStatus(project, deployment)) {
          statusText = t('scene_detail_page.unsynced')
          badgeColor = '#FFBC5B'
          break
        }
      }
    }

    return (
      <Badge className="status-badge" color={badgeColor}>
        {statusText}
      </Badge>
    )
  }

  const renderPage = (project: Project, deployments: Deployment[]) => {
    const { isLoadingDeployments, onNavigate, onOpenModal, onDuplicate, onDelete } = props
    return (
      <>
        <Section size="large">
          <Row>
            <Column>
              <Row>
                <Back absolute onClick={() => onNavigate(locations.scenes())} />
                <Header className="name">
                  {project.title}
                  <Icon name="edit outline" onClick={handleEditClick} />
                </Header>
              </Row>
            </Column>
            <Column className="actions" align="right">
              <Row>
                <Button inverted className="download-button" onClick={() => onOpenModal('ExportModal', { project })}>
                  <Icon name="download" />
                  {t('scene_detail_page.download_scene')}
                </Button>
                <Button primary className="edit-button" onClick={() => onNavigate(locations.sceneEditor(project.id))}>
                  <Icon name="edit outline" />
                  {t('scene_detail_page.edit_scene')}
                </Button>
                <Dropdown
                  trigger={
                    <Button basic>
                      <Icon name="ellipsis horizontal" />
                    </Button>
                  }
                  inline
                  direction="left"
                >
                  <Dropdown.Menu>
                    <Dropdown.Item text={t('scene_detail_page.actions.duplicate')} onClick={() => onDuplicate(project)} />
                    <Dropdown.Item text={t('scene_detail_page.actions.delete')} onClick={() => onDelete(project)} />
                  </Dropdown.Menu>
                </Dropdown>
              </Row>
            </Column>
          </Row>
          <Row>
            <Column>{getSceneStatus()}</Column>
          </Row>
        </Section>
        <Section>
          <div className="header-image" style={{ backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : '' }} />
        </Section>
        <Section className={project.description ? '' : 'no-margin-bottom'}>
          <Header sub>{t('scene_detail_page.published_in')}</Header>
          {isLoadingDeployments ? (
            <Loader active size="small" />
          ) : deployments.length === 0 ? (
            <Empty className="empty-deployments-container">
              <div className="empty-deployments-thumbnail" />
              {t('scene_detail_page.no_deployments')}
            </Empty>
          ) : (
            <>
              <div className="deployments">
                {deployments.map(deployment => (
                  <DeploymentDetail key={deployment.id} project={project} deployment={deployment} />
                ))}
              </div>
              <div className="notice">{t('analytics.notice')}</div>
            </>
          )}
        </Section>
        {project.description ? (
          <Section className="description no-margin-bottom">
            <Header sub>{t('scene_detail_page.description')}</Header>
            <p className="description-content">{project.description}</p>
          </Section>
        ) : null}
      </>
    )
  }

  return (
    <>
      <Navbar isFullscreen />
      <Page className="SceneDetailPage" isFullscreen>
        {isLoading && !project ? renderLoading() : null}
        {!isLoading && !project ? renderNotFound() : null}
        {project ? renderPage(project, deployments) : null}
      </Page>
      <Footer />
    </>
  )
}

export default React.memo(SceneDetailPage)
