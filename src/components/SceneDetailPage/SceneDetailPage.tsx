import React, { useCallback, useState } from 'react'
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
import DeploymentDetail from './DeploymentDetail'
import './SceneDetailPage.css'

const SceneDetailPage: React.FC<Props> = props => {
  const { project, isLoading, deployments, onOpenModal, onDelete, onDuplicate } = props
  const [isDeleting, setIsDeleting] = useState(false)

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

  const getSceneStatus = () => {
    const { project, isLoading, isLoadingDeployments } = props

    if (isLoading || isLoadingDeployments || !project) {
      return null
    }

    return <DeploymentStatus projectId={project.id} className="deployment-status" />
  }

  const renderPage = (project: Project, deployments: Deployment[]) => {
    const { isLoadingDeployments, onNavigate, onOpenModal } = props
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
                    <Dropdown.Item text="Open Inspector" onClick={() => onNavigate(locations.inspector(project.id))} />
                    <Dropdown.Item text={t('scene_detail_page.actions.duplicate')} onClick={handleDuplicateClick} />
                    <Dropdown.Item text={t('scene_detail_page.actions.delete')} onClick={handleDeleteClick} />
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
      </Page>
      <Footer />
    </>
  )
}

export default React.memo(SceneDetailPage)
