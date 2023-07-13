import { useCallback, useEffect, useState } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Modal, Button, ModalNavigation } from 'decentraland-ui'
import handsCategoryImg from '../../../images/hands_category_img.png'
import { Props } from './HandsCategoryLaunchModal.types'
import styles from './HandsCategoryLaunchModal.module.css'

const HANDS_CATEGORY_FTU_KEY = 'hands-category-builder-ftu-key'

export const HandsCategoryLaunchModal = ({ isHandsCategoryEnabled, isLoadingFeatureFlags }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const onClose = useCallback(() => {
    localStorage.setItem(HANDS_CATEGORY_FTU_KEY, 'true')
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isLoadingFeatureFlags && isHandsCategoryEnabled && !localStorage.getItem(HANDS_CATEGORY_FTU_KEY)) {
      setIsOpen(true)
    }
  }, [isLoadingFeatureFlags, isHandsCategoryEnabled])

  return (
    <Modal open={isOpen} size="small" onClose={onClose} className={styles.handCategoryModal}>
      <ModalNavigation title={t('hands_category_ftu.title')} onClose={onClose} />
      <div className={styles.container}>
        <img src={handsCategoryImg} aria-label={t('hands_category_ftu.img_alt')} />
        <span className={styles.description}>
          {t('hands_category_ftu.description', {
            b: (chunks: string) => <strong>{chunks}</strong>,
            br: () => <br />
          })}
        </span>
        <Button
          as="a"
          href="https://docs.decentraland.org/creator/wearables/creating-wearables/"
          target="_blank"
          className={styles.actionButton}
          primary
        >
          {t('hands_category_ftu.action')}
        </Button>
      </div>
    </Modal>
  )
}
