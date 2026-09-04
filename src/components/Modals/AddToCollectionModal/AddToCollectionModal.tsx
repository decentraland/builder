import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import uuid from 'uuid'
import { Button, Field, Form, InputOnChangeData, ModalActions, ModalContent, ModalNavigation } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { openModal } from 'decentraland-dapps/dist/modules/modal'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { RootState } from 'modules/common/types'
import { isLoggedIn } from 'modules/identity/selectors'
import { getError, getLoading } from 'modules/collection/selectors'
import { SAVE_COLLECTION_REQUEST, saveCollectionRequest } from 'modules/collection/actions'
import { Collection, COLLECTION_NAME_MAX_LENGTH } from 'modules/collection/types'
import { isTPCollection } from 'modules/collection/utils'
import { buildDefaultCatalystCollectionURN } from 'lib/urn'
import { redirectToAuthDapp } from 'routing/locations'
import CollectionDropdown from 'components/CollectionDropdown'
import { Props } from './AddToCollectionModal.types'
import './AddToCollectionModal.css'

export default function AddToCollectionModal({ name, metadata, onClose }: Props) {
  const dispatch = useDispatch()
  const address = useSelector(getAddress)
  const loggedIn = useSelector(isLoggedIn)
  const isSaving = useSelector((state: RootState) => isLoadingType(getLoading(state), SAVE_COLLECTION_REQUEST))
  const collectionError = useSelector(getError)

  const [collection, setCollection] = useState<Collection>()
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const handleProceed = useCallback(
    (collectionId: string) => {
      onClose()
      dispatch(openModal('CreateSingleItemModal', { collectionId, file: metadata.file, prefill: metadata.prefill }))
    },
    [dispatch, metadata, onClose]
  )

  // The collection id is generated client-side, so the flow can continue with it as soon as
  // the save request finishes without an error.
  const pendingCollectionIdRef = useRef<string | null>(null)
  const wasSavingRef = useRef(false)
  useEffect(() => {
    if (wasSavingRef.current && !isSaving) {
      wasSavingRef.current = false
      if (!collectionError && pendingCollectionIdRef.current) {
        handleProceed(pendingCollectionIdRef.current)
      }
      pendingCollectionIdRef.current = null
    } else if (isSaving && pendingCollectionIdRef.current) {
      wasSavingRef.current = true
    }
  }, [isSaving, collectionError, handleProceed])

  const handleCreateAndContinue = useCallback(() => {
    if (!newCollectionName || !address) return
    const now = Date.now()
    const newCollection: Collection = {
      id: uuid.v4(),
      name: newCollectionName,
      urn: buildDefaultCatalystCollectionURN(),
      owner: address,
      isPublished: false,
      isApproved: false,
      minters: [],
      managers: [],
      createdAt: now,
      updatedAt: now
    }
    pendingCollectionIdRef.current = newCollection.id
    dispatch(saveCollectionRequest(newCollection))
  }, [dispatch, address, newCollectionName])

  const handleNameChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    setNewCollectionName(data.value)
  }, [])

  if (!loggedIn) {
    return (
      <Modal name={name} onClose={onClose} size="tiny" className="AddToCollectionModal">
        <ModalNavigation title={t('add_to_collection_modal.sign_in.title')} onClose={onClose} />
        <ModalContent>
          <p className="sign-in-text">{t('add_to_collection_modal.sign_in.subtitle')}</p>
        </ModalContent>
        <ModalActions>
          <Button primary onClick={() => redirectToAuthDapp()}>
            {t('add_to_collection_modal.sign_in.action')}
          </Button>
        </ModalActions>
      </Modal>
    )
  }

  if (isCreatingNew) {
    const errorMessage =
      collectionError === 'Name already in use' ? t('create_collection_modal.error_name_already_in_use') : collectionError
    return (
      <Modal name={name} onClose={onClose} size="small">
        <ModalNavigation
          title={t('create_collection_modal.title')}
          subtitle={t('create_collection_modal.subtitle')}
          onBack={() => setIsCreatingNew(false)}
          onClose={onClose}
        />
        <Form onSubmit={handleCreateAndContinue} disabled={!newCollectionName || isSaving}>
          <ModalContent>
            <Field
              label={t('create_collection_modal.label')}
              placeholder={t('create_collection_modal.placeholder')}
              value={newCollectionName}
              maxLength={COLLECTION_NAME_MAX_LENGTH}
              message={errorMessage ?? t('create_collection_modal.message', { maxLength: COLLECTION_NAME_MAX_LENGTH })}
              error={!!errorMessage}
              onChange={handleNameChange}
            />
          </ModalContent>
          <ModalActions>
            <Button primary loading={isSaving} disabled={!newCollectionName || isSaving}>
              {t('add_to_collection_modal.continue')}
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    )
  }

  return (
    <Modal name={name} onClose={onClose} size="tiny" className="AddToCollectionModal select-collection-step">
      <ModalNavigation title={t('add_to_collection_modal.title')} subtitle={t('add_to_collection_modal.subtitle')} onClose={onClose} />
      <ModalContent>
        <CollectionDropdown
          value={collection}
          onChange={setCollection}
          filter={collection => !isTPCollection(collection) && !collection.isPublished}
          fetchCollectionParams={{ isPublished: false }}
        />
      </ModalContent>
      <ModalActions>
        <Button secondary onClick={() => setIsCreatingNew(true)}>
          {t('add_to_collection_modal.create_new')}
        </Button>
        <Button primary disabled={!collection} onClick={() => collection && handleProceed(collection.id)}>
          {t('add_to_collection_modal.continue')}
        </Button>
      </ModalActions>
    </Modal>
  )
}
