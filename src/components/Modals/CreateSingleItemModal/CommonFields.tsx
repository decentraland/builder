import React, { useCallback } from 'react'
import { Field, SelectField } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Mapping, MappingType, Rarity, WearableCategory } from '@dcl/schemas'
import { ItemType, ITEM_NAME_MAX_LENGTH } from 'modules/item/types'
import { getWearableCategories, getEmoteCategories, isSmart, buildItemMappings, isImageFile } from 'modules/item/utils'
import { MappingEditor } from 'components/MappingEditor'
import { THUMBNAIL_PATH } from 'modules/item/types'
import { createItemActions } from './CreateSingleItemModal.reducer'
import { useCreateSingleItemModal } from './CreateSingleItemModal.context'
import { getDefaultMappings, getLinkedContract, getThumbnailType } from './utils'
import { convertImageIntoWearableThumbnail } from 'modules/media/utils'
import { getModelData, EngineType } from 'lib/getModelData'
import { getExtension } from 'lib/file'
import { isThirdParty } from 'lib/urn'

const RARITIES_LINK = 'https://docs.decentraland.org/creator/wearables-and-emotes/manage-collections'

const defaultMapping: Mapping = { type: MappingType.ANY }

export const CommonFields: React.FC = () => {
  const { state, collection, isThirdPartyV2Enabled, isLoading, dispatch } = useCreateSingleItemModal()

  // Field handlers - moved from main modal to here since they're only used in CommonFields
  const handleNameChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, props: any) =>
      dispatch(createItemActions.setName(props.value.slice(0, ITEM_NAME_MAX_LENGTH))),
    [dispatch]
  )

  const handleRarityChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, data: any) => {
      dispatch(createItemActions.setRarity(data.value))
    },
    [dispatch]
  )

  const handleCategoryChange = useCallback(
    (_event: React.SyntheticEvent<HTMLElement, Event>, data: any) => {
      const category = data.value as WearableCategory
      const hasChangedThumbnailType =
        (state.category && getThumbnailType(category) !== getThumbnailType(state.category as WearableCategory)) || !state.category

      if (state.category !== category) {
        dispatch(createItemActions.setCategory(category))
        if (state.type === ItemType.WEARABLE && hasChangedThumbnailType) {
          void updateThumbnailByCategory(category)
        }
      }
    },
    [state, dispatch]
  )

  const handleMappingChange = useCallback(
    (mapping: any) => {
      const contract = getLinkedContract(collection)
      if (!contract) {
        return
      }
      dispatch(createItemActions.setMappings(buildItemMappings(mapping, contract)))
    },
    [collection, dispatch]
  )

  const getMapping = useCallback((): Mapping => {
    const { mappings } = state
    const contract = getLinkedContract(collection)
    if (!contract) {
      return defaultMapping
    }

    let mapping: Mapping | undefined
    if (mappings) {
      mapping = mappings[contract.network]?.[contract.address][0]
    } else {
      mapping = getDefaultMappings(contract, isThirdPartyV2Enabled)?.[contract.network]?.[contract.address][0]
    }

    return mapping ?? defaultMapping
  }, [collection, state, isThirdPartyV2Enabled])

  const updateThumbnailByCategory = useCallback(
    async (category: WearableCategory) => {
      const { model, contents } = state

      const isCustom = !!contents && THUMBNAIL_PATH in contents
      if (!isCustom) {
        dispatch(createItemActions.setLoading(true))
        let thumbnail
        if (contents && isImageFile(model!)) {
          thumbnail = await convertImageIntoWearableThumbnail(contents[THUMBNAIL_PATH] || contents[model!], category)
        } else {
          const url = URL.createObjectURL(contents![model!])
          const { image } = await getModelData(url, {
            width: 1024,
            height: 1024,
            thumbnailType: getThumbnailType(category),
            extension: (model && getExtension(model)) || undefined,
            engine: EngineType.BABYLON
          })
          thumbnail = image
          URL.revokeObjectURL(url)
        }
        dispatch(createItemActions.setThumbnail(thumbnail))
        dispatch(createItemActions.setLoading(false))
      }
    },
    [state, dispatch]
  )
  const { name, category, rarity, contents, item, type } = state

  const belongsToAThirdPartyCollection = collection?.urn && isThirdParty(collection.urn)
  const rarities = Rarity.getRarities()
  const categories: string[] = type === ItemType.WEARABLE ? getWearableCategories(contents) : getEmoteCategories()
  const linkedContract = getLinkedContract(collection)

  const raritiesLink =
    RARITIES_LINK +
    (type === ItemType.EMOTE
      ? '/uploading-emotes/#rarity'
      : isSmart({ type, contents })
      ? '/uploading-smart-wearables/#rarity'
      : '/uploading-wearables/#rarity')

  return (
    <>
      <Field
        className="name"
        label={t('create_single_item_modal.name_label')}
        value={name}
        disabled={isLoading}
        onChange={handleNameChange}
      />
      {(!item || !item.isPublished) && !belongsToAThirdPartyCollection ? (
        <SelectField
          label={
            <div className="field-header">
              {t('create_single_item_modal.rarity_label')}
              <a href={raritiesLink} target="_blank" rel="noopener noreferrer" className="learn-more">
                {t('global.learn_more')}
              </a>
            </div>
          }
          placeholder={t('create_single_item_modal.rarity_placeholder')}
          value={rarity}
          options={rarities.map(value => ({
            value,
            label: t('wearable.supply', {
              count: Rarity.getMaxSupply(value),
              formatted: Rarity.getMaxSupply(value).toLocaleString()
            }),
            text: t(`wearable.rarity.${value}`)
          }))}
          disabled={isLoading}
          onChange={handleRarityChange}
        />
      ) : null}
      <SelectField
        required
        disabled={isLoading}
        label={t('create_single_item_modal.category_label')}
        placeholder={t('create_single_item_modal.category_placeholder')}
        value={categories.includes(category!) ? category : undefined}
        options={categories.map(value => ({ value, text: t(`${type!}.category.${value}`) }))}
        onChange={handleCategoryChange}
      />
      {isThirdPartyV2Enabled && linkedContract && <MappingEditor onChange={handleMappingChange} mapping={getMapping()} />}
    </>
  )
}

export default CommonFields
