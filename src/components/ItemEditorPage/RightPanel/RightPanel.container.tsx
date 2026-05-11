import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import equal from 'fast-deep-equal'
import { getAddress, isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { getCampaignName, getContentfulNormalizedLocale, getMainTag } from 'decentraland-dapps/dist/modules/campaign'
import { RootState } from 'modules/common/types'
import { getItem, getError as getItemError, getStatusByItemId, isDownloading } from 'modules/item/selectors'
import { deleteItemRequest, downloadItemRequest, saveItemRequest } from 'modules/item/actions'
import { openModal } from 'decentraland-dapps/dist/modules/modal/actions'
import { hasMultipleModels, isOwner } from 'modules/item/utils'
import { useGetSelectedItemIdFromCurrentUrl } from 'modules/location/hooks'
import { getCollection, hasViewAndEditRights } from 'modules/collection/selectors'
import { isWalletCommitteeMember } from 'modules/committee/selectors'
import { getIsCampaignEnabled, getIsVrmOptOutEnabled, getIsWearableUtilityEnabled } from 'modules/features/selectors'
import { BodyShape } from '@dcl/schemas'
import {
  getBodyShape,
  getBonesForCurrentShape,
  getBonesForShape,
  getCurrentRepresentationHash,
  getSpringBoneParamsForCurrentShape,
  getSpringBoneParamsForShape,
  hasSpringBoneChanges as hasSpringBoneChangesSelector
} from 'modules/editor/selectors'
import {
  setSpringBoneParam,
  addSpringBoneParams,
  deleteSpringBoneParams,
  resetSpringBoneParams,
  setBodyShape
} from 'modules/editor/actions'
import { BoneNode, SpringBoneParams } from 'modules/editor/types'
import { RightPanelContainerProps } from './RightPanel.types'
import RightPanel from './RightPanel'

const RightPanelContainer: React.FC<RightPanelContainerProps> = () => {
  const dispatch = useDispatch()
  const selectedItemId = useGetSelectedItemIdFromCurrentUrl()

  const address = useSelector((state: RootState) => getAddress(state))
  const isConnectedValue = useSelector((state: RootState) => isConnected(state))
  const error = useSelector((state: RootState) => getItemError(state))
  const isDownloadingValue = useSelector((state: RootState) => isDownloading(state))
  const isCommitteeMember = useSelector((state: RootState) => isWalletCommitteeMember(state))
  const isCampaignEnabled = useSelector((state: RootState) => getIsCampaignEnabled(state))
  const campaignTag = useSelector((state: RootState) => getMainTag(state))
  const isVrmOptOutEnabled = useSelector((state: RootState) => getIsVrmOptOutEnabled(state))
  const isWearableUtilityEnabled = useSelector((state: RootState) => getIsWearableUtilityEnabled(state))

  const selectedItem = useSelector((state: RootState) => (selectedItemId ? getItem(state, selectedItemId) : null))
  const collection = useSelector((state: RootState) =>
    selectedItemId && selectedItem && selectedItem.collectionId ? getCollection(state, selectedItem.collectionId) : null
  )
  const campaignName = useSelector((state: RootState) => {
    const campaignNames = getCampaignName(state)
    const locale = getContentfulNormalizedLocale(state)
    return campaignNames?.[locale]
  })
  const statusByItemId = useSelector((state: RootState) => getStatusByItemId(state))
  const canEditSelectedItem = useSelector((state: RootState) => {
    if (!selectedItem || !address) return false

    return collection ? hasViewAndEditRights(state, address, collection) : isOwner(selectedItem, address)
  })

  const itemStatus = useMemo(() => (selectedItemId ? statusByItemId[selectedItemId] : null), [selectedItemId, statusByItemId])
  const selectedBodyShape = useSelector((state: RootState) => getBodyShape(state))
  const currentHash = useSelector((state: RootState) => getCurrentRepresentationHash(state))
  const bones = useSelector((state: RootState) => getBonesForCurrentShape(state), equal)
  const springBoneParams = useSelector((state: RootState) => getSpringBoneParamsForCurrentShape(state), equal)
  // Per-shape views derived from byHash state — kept for tab-badge logic in SpringBonesSection
  // and the save-warning toast that checks whether each shape has any params.
  const maleBones = useSelector((state: RootState) => getBonesForShape(state, BodyShape.MALE), equal)
  const femaleBones = useSelector((state: RootState) => getBonesForShape(state, BodyShape.FEMALE), equal)
  const maleParams = useSelector((state: RootState) => getSpringBoneParamsForShape(state, BodyShape.MALE), equal)
  const femaleParams = useSelector((state: RootState) => getSpringBoneParamsForShape(state, BodyShape.FEMALE), equal)
  const bonesByShape = useMemo<Partial<Record<BodyShape, BoneNode[]>>>(
    () => ({ [BodyShape.MALE]: maleBones, [BodyShape.FEMALE]: femaleBones }),
    [maleBones, femaleBones]
  )
  const springBoneParamsByShape = useMemo<Partial<Record<BodyShape, Record<string, SpringBoneParams>>>>(
    () => ({ [BodyShape.MALE]: maleParams, [BodyShape.FEMALE]: femaleParams }),
    [maleParams, femaleParams]
  )
  const hasSpringBoneChanges = useSelector((state: RootState) => hasSpringBoneChangesSelector(state))

  const hasTwoRepresentations = useMemo(() => (selectedItem ? hasMultipleModels(selectedItem) : false), [selectedItem])
  const hasSpringBonesInGlb = useMemo(
    () => Object.values(bonesByShape).some(bones => bones?.some(b => b.type === 'spring')),
    [bonesByShape]
  )
  const onSaveItem: ActionFunction<typeof saveItemRequest> = useCallback(
    (item, contents) => dispatch(saveItemRequest(item, contents)),
    [dispatch]
  )

  const onDeleteItem: ActionFunction<typeof deleteItemRequest> = useCallback(item => dispatch(deleteItemRequest(item)), [dispatch])
  const onOpenModal: ActionFunction<typeof openModal> = useCallback((name, metadata) => dispatch(openModal(name, metadata)), [dispatch])
  const onDownload: ActionFunction<typeof downloadItemRequest> = useCallback(itemId => dispatch(downloadItemRequest(itemId)), [dispatch])
  const onSpringBoneParamChange = useCallback(
    (boneName: string, field: keyof SpringBoneParams, value: SpringBoneParams[typeof field]) => {
      if (!currentHash) return
      dispatch(setSpringBoneParam(currentHash, boneName, field, value))
    },
    [dispatch, currentHash]
  )
  const onAddSpringBoneParams = useCallback(
    (boneName: string) => {
      if (!currentHash) return
      dispatch(addSpringBoneParams(currentHash, boneName))
    },
    [dispatch, currentHash]
  )
  const onDeleteSpringBoneParams = useCallback(
    (boneName: string) => {
      if (!currentHash) return
      dispatch(deleteSpringBoneParams(currentHash, boneName))
    },
    [dispatch, currentHash]
  )
  const onResetSpringBoneParams: ActionFunction<typeof resetSpringBoneParams> = useCallback(
    () => dispatch(resetSpringBoneParams()),
    [dispatch]
  )
  const onBodyShapeTabChange: ActionFunction<typeof setBodyShape> = useCallback((to: BodyShape) => dispatch(setBodyShape(to)), [dispatch])

  return (
    <RightPanel
      address={address}
      collection={collection}
      selectedItem={selectedItem}
      selectedItemId={selectedItemId}
      canEditSelectedItem={canEditSelectedItem}
      itemStatus={itemStatus}
      error={error}
      isConnected={isConnectedValue}
      isDownloading={isDownloadingValue}
      isCommitteeMember={isCommitteeMember}
      isCampaignEnabled={isCampaignEnabled}
      campaignTag={campaignTag}
      campaignName={campaignName}
      isVrmOptOutEnabled={isVrmOptOutEnabled}
      isWearableUtilityEnabled={isWearableUtilityEnabled}
      selectedBodyShape={selectedBodyShape}
      bones={bones}
      springBoneParams={springBoneParams}
      onSaveItem={onSaveItem}
      onDeleteItem={onDeleteItem}
      onOpenModal={onOpenModal}
      onDownload={onDownload}
      onSpringBoneParamChange={onSpringBoneParamChange}
      onAddSpringBoneParams={onAddSpringBoneParams}
      onDeleteSpringBoneParams={onDeleteSpringBoneParams}
      hasSpringBoneChanges={hasSpringBoneChanges}
      hasSpringBonesInGlb={hasSpringBonesInGlb}
      onResetSpringBoneParams={onResetSpringBoneParams}
      hasTwoRepresentations={hasTwoRepresentations}
      springBoneParamsByShape={springBoneParamsByShape}
      bonesByShape={bonesByShape}
      onBodyShapeTabChange={onBodyShapeTabChange}
    />
  )
}

export default RightPanelContainer
