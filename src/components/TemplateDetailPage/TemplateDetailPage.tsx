import React, { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { Page, Center, Loader, Section, Row, Column, Header, Button, Logo, Icon } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { usePlayVideoOnHover } from 'lib/video'
import { Project } from 'modules/project/types'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import NotFound from 'components/NotFound'
import { Props } from './TemplateDetailPage.types'

import './TemplateDetailPage.css'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

const PUBLIC_URL = process.env.PUBLIC_URL

const TemplateDetailPage: React.FC<Props> = props => {
  const { template, isLoading, onOpenModal, onNavigate } = props
  const { hovered, video, onMouseEnter, onMouseLeave } = usePlayVideoOnHover()

  const analytics = getAnalytics()

  const eventInfo = useMemo(
    () => ({
      id: template?.id,
      name: template?.title,
      description: template?.description
    }),
    [template]
  )

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
    analytics.track('Download Template', eventInfo)
    onOpenModal('ExportModal', { project: template })
  }, [analytics, template, eventInfo, onOpenModal])

  const handleBackClick = useCallback(() => {
    onNavigate(locations.templates())
  }, [onNavigate])

  const handleSelectTemplateClick = useCallback(() => {
    if (template) {
      analytics.track('Select Template', eventInfo)
      onOpenModal('CloneTemplateModal', { template })
    }
  }, [analytics, template, eventInfo, onOpenModal])

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
          <div className="template-media" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {template.video && (
              <video
                className={classNames('header-image', { 'image-hidden': !hovered })}
                src={`${PUBLIC_URL}${template.video}`}
                muted
                ref={video}
              />
            )}
            <div
              className={classNames('header-image', { 'image-hidden': !!hovered && template.video })}
              style={{ backgroundImage: `url(${template.thumbnail})` }}
            />
          </div>
        </Section>
        <Section>
          <Row className="content info-container">
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
