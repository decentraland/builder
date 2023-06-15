import { useCallback } from 'react'
import { Button, Icon, Page } from 'decentraland-ui'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import Navigation from 'components/Navigation'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import { Props } from './TemplatesPage.types'
import styles from './TemplatesPage.module.css'

const TEMPLATES = [
  {
    name: 'The house',
    description: 'The house',
    thumbnail: 'Thumbnail',
    creator: 'Decentraland Foundation',
    sceneDetails: { size: 4 },
    location: 'Loc',
    status: 'ACTIVE'
  },
  {
    name: 'The office',
    description: 'The office',
    thumbnail: 'Thumbnail',
    creator: 'Decentraland Foundation',
    sceneDetails: { size: 4 },
    s3_url: 'Loc',
    status: 'ACTIVE'
  },
  {
    name: 'The theater',
    description: 'The theater',
    thumbnail: 'Thumbnail',
    creator: 'Decentraland Foundation',
    sceneDetails: { size: 4 },
    s3_url: 'Loc',
    status: 'ACTIVE'
  }
]

export default function TemplatesPage({ onNavigate }: Props) {
  const handleBackClick = useCallback(() => {
    onNavigate(locations.scenes())
  }, [onNavigate])

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
        {TEMPLATES.forEach(({ name }) => (
          <span>{name}</span>
        ))}
      </Page>
      <Footer />
    </>
  )
}
