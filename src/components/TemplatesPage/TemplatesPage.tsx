import { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Page, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Project, TemplateStatus } from 'modules/project/types'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import SceneCard from 'components/SceneCard'
import Navigation from 'components/Navigation'
import CustomIcon from 'components/Icon'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Props } from './TemplatesPage.types'
import styles from './TemplatesPage.module.css'

export const TemplatesPage: React.FC<Props> = ({ templates, onLoadTemplates }) => {
  const analytics = getAnalytics()
  const history = useHistory()

  useEffect(() => {
    onLoadTemplates()
  }, [onLoadTemplates])

  const handleBackClick = useCallback(() => {
    history.push(locations.scenes())
  }, [history])

  const handleGoToTemplate = useCallback(
    (template: Project) => {
      analytics.track('Go to template detail', {
        id: template.id,
        name: template.title,
        description: template.description
      })
      history.push(locations.templateDetail(template.id))
    },
    [analytics, history]
  )

  return (
    <>
      <Navbar />
      <Page isFullscreen className="ScenesPage">
        <Navigation activeTab={NavigationTab.SCENES} />
        <div className={styles.titleContainer}>
          <Button
            className={styles.backButton}
            basic
            icon={<Icon name="arrow alternate circle left outline" />}
            onClick={handleBackClick}
            aria-label={t('templates_page.back_to_scenes')}
          />
          <h2 className={styles.title}>{t('templates_page.title')}</h2>
        </div>
        <div className={styles.templates}>
          {Object.values(templates).map(template => (
            <SceneCard
              key={template.id}
              title={template.title}
              description={template.description}
              videoSrc={template.video}
              imgSrc={template.thumbnail}
              subtitle={
                <span className={styles.subtitle}>
                  <CustomIcon name="scene-parcel" />
                  {t('templates_page.parcels', {
                    size: template.layout.rows * template.layout.cols
                  })}
                </span>
              }
              tag={
                template.templateStatus !== TemplateStatus.ACTIVE ? { label: t('templates_page.coming_soon'), color: '#716B7C' } : undefined
              }
              disabled={template.templateStatus !== TemplateStatus.ACTIVE}
              onClick={handleGoToTemplate.bind(null, template)}
            />
          ))}
        </div>
      </Page>
      <Footer />
    </>
  )
}
