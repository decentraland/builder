import React, { useCallback } from 'react'
import { Page, Center, Loader, Section, Row, Column, Header, Button, Logo, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { Project } from 'modules/project/types'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import NotFound from 'components/NotFound'
import { Props } from './TemplateDetailPage.types'

import './TemplateDetailPage.css'

const TemplateDetailPage: React.FC<Props> = props => {
  const { template, isLoading, onOpenModal, onNavigate } = props

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

  const handleDownloadClick = useCallback(() => {
    onOpenModal('ExportModal', { project: template })
  }, [template, onOpenModal])

  const handleBackClick = useCallback(() => {
    onNavigate(locations.templates())
  }, [onNavigate])

  const handleSelectTemplateClick = useCallback(() => {
    if (template) {
      console.log('TODO: Clone template:', template.id)
      // onOpenModal('CloneTemplateModal', { template })
    }
  }, [template])

  const renderPage = (template: Project) => {
    return (
      <>
        <Section size="large">
          <Row>
            <Column>
              <Row>
                <div className="title-container">
                  <Button
                    className="back-button"
                    basic
                    icon={<Icon name="arrow alternate circle left outline" />}
                    onClick={handleBackClick}
                    aria-label={t('templates_page.back_to_scenes')}
                  />
                  <Header className="name">{template.title}</Header>
                </div>
              </Row>
            </Column>
          </Row>
        </Section>
        <Section>
          <div className="header-image" style={{ backgroundImage: `url(${template.thumbnail})` }} />
        </Section>
        <Section>
          <Row className="content">
            <Column className="creator-container">
              <Header>{t('template_detail_page.creator')}</Header>
              <p className="description-content">
                <Logo /> Decentraland
                <br />
                Foundation
              </p>
            </Column>
            <Column className="description-container">
              <Header>{t('template_detail_page.description')}</Header>
              <p className="description-content">{template.description}</p>
            </Column>
            <Column className="action-buttons-container">
              <Button primary className="select-button" onClick={handleSelectTemplateClick}>
                {t('template_detail_page.select_template')}
              </Button>
              <Button inverted className="download-button" onClick={handleDownloadClick}>
                {t('template_detail_page.download_scene')}
              </Button>
              <Button
                inverted
                className="learn-more-button"
                as="a"
                href="https://docs.decentraland.org/creator/builder/manage-scenes/#export-a-scene"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('global.learn_more')}
              </Button>
            </Column>
          </Row>
          <Row className="content">
            <Column className="scene-details-container">
              <Header>{t('template_detail_page.scene_details')}</Header>
              <p className="description-content world">{t('template_detail_page.built_for_world')}</p>
              <p className="description-content size-scene">{t('template_detail_page.parcels', { ...template.layout })}</p>
              <p className="description-content personalize-content">{t('template_detail_page.personalize_it_yourself')}</p>
            </Column>
          </Row>
        </Section>
      </>
    )
  }

  return (
    <>
      <Navbar isFullscreen />
      <Page className="TemplateDetailPage" isFullscreen>
        {isLoading && !template ? renderLoading() : null}
        {!isLoading && !template ? renderNotFound() : null}
        {template ? renderPage(template) : null}
      </Page>
      <Footer />
    </>
  )
}

export default React.memo(TemplateDetailPage)
