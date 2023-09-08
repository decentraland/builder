import React, { useCallback, useEffect, useState } from 'react'
import { Props } from './SceneDetailPage.types'
import { Page, Center, Loader, Section, Row, Column, Header, Button, Dropdown, Icon, Empty, Confirm } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Deployment } from 'modules/deployment/types'
import { Project } from 'modules/project/types'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import Back from 'components/Back'
import NotFound from 'components/NotFound'
import DeploymentStatus from 'components/DeploymentStatus'
import SDKTag from 'components/SDKTag/SDKTag'
import DeploymentDetail from './DeploymentDetail'
import MigrateSceneToSDK7 from './MigrateSceneToSDK7'
import './SceneDetailPage.css'

const SceneDetailPage: React.FC<Props> = props => {
  const { project, scene, isLoading, deployments, onOpenModal, onDelete, onDuplicate, onNavigate, onLoadProjectScene } = props
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMigrationModal, setShowMigrationModal] = useState(false)

  useEffect(() => {
    if (project && !scene) {
      onLoadProjectScene(project)
    }
  }, [project, scene, onLoadProjectScene])

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

  const handleDeleteClick = useCallback(() => {
    setIsDeleting(true)
  }, [setIsDeleting])

  const handleDuplicateClick = useCallback(() => {
    onDuplicate(project as Project)
  }, [project, onDuplicate])

  const handleConfirmDeleteProject = useCallback(() => {
    onDelete(project as Project)
    setIsDeleting(false)
  }, [project, onDelete, setIsDeleting])

  const handleCancelDeleteProject = useCallback(() => {
    setIsDeleting(false)
  }, [setIsDeleting])

  const handleEditScene = useCallback(() => {
    if (scene?.sdk6) {
      setShowMigrationModal(true)
    } else {
      onNavigate(locations.inspector(project?.id))
    }
  }, [project, scene, onNavigate])

  const getSceneStatus = () => {
    const { project, isLoading, isLoadingDeployments } = props

    if (isLoading || isLoadingDeployments || !project) {
      return null
    }

    return <DeploymentStatus projectId={project.id} className="deployment-status" />
  }

  const renderPage = (project: Project, deployments: Deployment[]) => {
    const { isLoadingDeployments, onNavigate, onOpenModal, scene } = props
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
                <Button primary className="edit-button" disabled={!scene} loading={!scene} onClick={handleEditScene}>
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
                    <Dropdown.Item text={t('scene_detail_page.actions.duplicate')} onClick={handleDuplicateClick} />
                    <Dropdown.Item text={t('scene_detail_page.actions.delete')} onClick={handleDeleteClick} />
                  </Dropdown.Menu>
                </Dropdown>
              </Row>
            </Column>
          </Row>
          <Row className="status-container">
            {getSceneStatus()}
            <SDKTag scene={scene} />
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
        {project ? (
          <>
            {renderPage(project, deployments)}
            <Confirm
              size="tiny"
              open={isDeleting}
              header={t('project_card.confirm_delete_header', { title: project.title })}
              content={t('project_card.confirm_delete_content', { title: project.title })}
              confirmButton={<Button primary>{t('global.confirm')}</Button>}
              cancelButton={<Button secondary>{t('global.cancel')}</Button>}
              onCancel={handleCancelDeleteProject}
              onConfirm={handleConfirmDeleteProject}
            />
          </>
        ) : null}
        {showMigrationModal && (
          <MigrateSceneToSDK7 project={project} scene={scene} onNavigate={onNavigate} onClose={() => setShowMigrationModal(false)} />
        )}
      </Page>
      <Footer />
    </>
  )
}

export default React.memo(SceneDetailPage)
