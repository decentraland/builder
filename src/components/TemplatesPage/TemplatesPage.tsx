import { useCallback } from 'react'
import { Button, Page, Icon } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import { SceneCard } from 'components/SceneCard'
import Navigation from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Props } from './TemplatesPage.types'
import templates from './templates.json'
import styles from './TemplatesPage.module.css'

export default function TemplatesPage({ onNavigate }: Props) {
  const handleBackClick = useCallback(() => {
    onNavigate(locations.scenes())
  }, [onNavigate])

  const handleGoToTemplate = useCallback(templateId => {
    console.log('TODO: Go to template with id ', templateId)
  }, [])

  return (
    <>
      <Navbar isFullscreen />
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
          {templates.map(template => (
            <SceneCard
              key={template.id}
              title={template.title}
              description={template.description}
              videoSrc={template.video}
              imgSrc={template.thumbnail}
              subtitle={
                <span className={styles.subtitle}>
                  {t('templates_page.parcels', {
                    icon: () => <span className={styles.parcelsIcon} />,
                    size: template.parcels
                  })}
                </span>
              }
              disabled={template.status !== 'ACTIVE'}
              onClick={handleGoToTemplate.bind(null, template.id)}
            />
          ))}
        </div>
      </Page>
      <Footer />
    </>
  )
}
