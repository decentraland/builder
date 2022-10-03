import React, { useEffect, useState } from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { Props } from './PublishWizardCollectionModal.types'
import CollectionNameFatFingerModal from './CollectionNameFatFingerModal'
import './PublishWizardCollectionModal.css'
// import { Step, StepGroup } from 'decentraland-ui'
import { List } from 'decentraland-ui'

export const PublishWizardCollectionModal: React.FC<Props> = (props) => {
  const { collection, onClose, onFetchRarities } = props
  const [step, setStep] = useState<number>(1)

  useEffect(() => {
    if (!collection) {
      onClose()
    }

    onFetchRarities()
  }, [collection, onClose, onFetchRarities])

  const handleNextStep = () => {
    setStep(step + 1)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <CollectionNameFatFingerModal collection={collection} onHandleProceed={handleNextStep} onClose={onClose} />
      case 2:
        return <h1>WIP</h1>
      case 3:
        return <h1>WIP</h1>
      default:
        throw new Error('Step not found')
    }
  }

  return (
    <Modal className="PublishWizardCollectionModal" size="small" onClose={onClose}>
      <List horizontal>
        <List.Item className={`step ${step === 1 ? 'active' : ''}`.trimEnd()}></List.Item>
        <List.Item className={`step ${step === 2 ? 'active' : ''}`.trimEnd()}></List.Item>
        <List.Item className={`step ${step === 3 ? 'active' : ''}`.trimEnd()}></List.Item>
        <List.Item className={`step ${step === 4 ? 'active' : ''}`.trimEnd()}></List.Item>
      </List>
      {renderStep()}
    </Modal>
  )
}

export default PublishWizardCollectionModal
