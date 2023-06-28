import { useCallback } from 'react'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SceneCard from '../SceneCard'
import { Props } from './SceneCreationSelector.types'
import styles from './SceneCreationSelector.module.css'

const PUBLIC_URL = process.env.PUBLIC_URL
const videoSrc = {
  scratch: `${PUBLIC_URL}/videos/scratch-preview.mov`,
  template: `${PUBLIC_URL}/videos/template-preview.mp4`
}
const imgSrc = {
  scratch: `${PUBLIC_URL}/images/scratch-preview-img.svg`,
  template: `${PUBLIC_URL}/images/template-preview-img.svg`
}

export default function SceneCreationSelector({ onOpenModal, onNavigate }: Props) {
  const handleOpenCreateFromScratchModal = useCallback(() => {
    onOpenModal('CustomLayoutModal')
  }, [onOpenModal])

  const handleCreateFromTemplate = useCallback(() => {
    onNavigate(locations.templates())
  }, [onNavigate])

  return (
    <div className={styles.container}>
      <SceneCard
        onClick={handleOpenCreateFromScratchModal}
        title={t('scenes_page.no_scenes.from_scratch.title')}
        videoSrc={videoSrc.scratch}
        imgSrc={imgSrc.scratch}
        description={t('scenes_page.no_scenes.from_scratch.description')}
      />
      <SceneCard
        onClick={handleCreateFromTemplate}
        title={t('scenes_page.no_scenes.from_template.title')}
        videoSrc={videoSrc.template}
        imgSrc={imgSrc.template}
        description={t('scenes_page.no_scenes.from_template.description')}
      />
    </div>
  )
}
