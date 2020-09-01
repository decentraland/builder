import * as React from 'react'
import { Props } from './SceneDetailPage.types'
import Navbar from 'components/Navbar'
import { Page, Center, Loader, Section, Row, Back, Narrow, Column, Header, Button, Dropdown, Icon, Empty } from 'decentraland-ui'
import Footer from 'components/Footer'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Project } from 'modules/project/types'
import { Deployment } from 'modules/deployment/types'
import { locations } from 'routing/locations'
import './SceneDetailPage.css'
import DeploymentDetail from './DeploymentDetail'

export default class SceneDetailPage extends React.PureComponent<Props> {
  renderLoading() {
    return (
      <Center>
        <Loader active size="large" />
      </Center>
    )
  }

  renderNotFound() {
    return (
      <Center>
        <span className="secondary-text">{t('global.not_found')}&hellip;</span>
      </Center>
    )
  }

  renderPage(project: Project, deployments: Deployment[]) {
    const { onNavigate, onOpenModal, onDuplicate, onDelete } = this.props
    return (
      <>
        <Section>
          <Row>
            <Back absolute onClick={() => onNavigate(locations.root())} />
            <Narrow>
              <Row>
                <Column>
                  <Row>
                    <Header size="huge">{project.title}</Header>
                  </Row>
                </Column>
                <Column className="actions" align="right">
                  <Row>
                    <Button basic onClick={() => onNavigate(locations.editor(project.id))}>
                      {t('scene_detail_page.actions.open_in_editor')}
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
                        <Dropdown.Item
                          text={t('scene_detail_page.actions.download')}
                          onClick={() => onOpenModal('ExportModal', { project })}
                        />
                        <Dropdown.Item text={t('scene_detail_page.actions.delete')} onClick={() => onDelete(project)} />
                      </Dropdown.Menu>
                    </Dropdown>
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Section>
            <div className="header-image" style={{ backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : '' }} />
          </Section>
          <Section className={project.description ? '' : 'no-margin-bottom'}>
            <Header sub>{t('scene_detail_page.published_in')}</Header>
            {deployments.length === 0 ? (
              <Empty height={100}>{t('scene_detail_page.no_deployments')}</Empty>
            ) : (
              <div className="deployments">
                {deployments.map(deployment => (
                  <DeploymentDetail project={project} deployment={deployment} />
                ))}
              </div>
            )}
          </Section>
          {project.description ? (
            <Section className="description no-margin-bottom">
              <Header sub>{t('scene_detail_page.description')}</Header>
              <p>{project.description}</p>
            </Section>
          ) : null}
        </Narrow>
      </>
    )
  }

  render() {
    const { project, isLoading, deployments } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Page className="SceneDetailPage">
          {isLoading && !project ? this.renderLoading() : null}
          {!isLoading && !project ? this.renderNotFound() : null}
          {project ? this.renderPage(project, deployments) : null}
        </Page>
        <Footer />
      </>
    )
  }
}
