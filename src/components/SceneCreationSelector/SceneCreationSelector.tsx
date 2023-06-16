import { useCallback } from 'react'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import SceneCard from '../SceneCard'
import { Props } from './SceneCreationSelector.types'
import styles from './SceneCreationSelector.module.css'

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
        videoSrc="/videos/scratch-preview.mov"
        imgSrc="/images/scratch-preview-img.svg"
        description={t('scenes_page.no_scenes.from_scratch.description')}
      />
      <SceneCard
        onClick={handleCreateFromTemplate}
        title={t('scenes_page.no_scenes.from_template.title')}
        videoSrc="/videos/template-preview.mp4"
        imgSrc="/images/template-preview-img.svg"
        description={t('scenes_page.no_scenes.from_template.description')}
      />
    </div>
  )
}
