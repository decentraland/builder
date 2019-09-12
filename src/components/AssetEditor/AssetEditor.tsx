import * as React from 'react'
import { Field, TagField, SelectField, DropdownProps, Radio } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { rawMappingsToObjectURL, revokeMappingsObjectURL, isGround } from 'modules/asset/utils'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { RawAsset } from 'modules/asset/types'
import { getModelData } from 'lib/getModelData'
import Icon from 'components/Icon'
import { Props, State } from './AssetEditor.types'
import './AssetEditor.css'

const CATEGORY_OPTIONS = [
  { key: 1, text: CategoryName.DECORATIONS_CATEGORY, value: CategoryName.DECORATIONS_CATEGORY },
  { key: 2, text: CategoryName.FURNITURE, value: CategoryName.FURNITURE },
  { key: 3, text: CategoryName.NATURE_CATEGORY, value: CategoryName.NATURE_CATEGORY },
  { key: 4, text: CategoryName.STRUCTURES_CATEGORY, value: CategoryName.STRUCTURES_CATEGORY },
  { key: 5, text: CategoryName.TILES_CATEGORY, value: CategoryName.TILES_CATEGORY }
]

export default class AssetEditor<T extends RawAsset> extends React.PureComponent<Props<T>, State> {
  handleCategoryChange = (_: React.SyntheticEvent, data: DropdownProps) => {
    const { asset } = this.props

    const category = data.value as CategoryName
    this.props.onChange({
      ...asset,
      category: category
    })
  }

  handleTagChange = (_: React.SyntheticEvent, data: DropdownProps) => {
    const { asset } = this.props
    const tags = data.value as string[]

    this.props.onChange({
      ...asset,
      tags
    })
  }

  handleToggleGround = async () => {
    const { asset } = this.props

    const hasGroundCategory = isGround(asset)
    const thumbnail = hasGroundCategory ? await this.handleGetThumbnail() : await this.handleGetThumbnail(true)
    const newAsset = {
      ...asset,
      category: hasGroundCategory ? CategoryName.DECORATIONS_CATEGORY : CategoryName.GROUND_CATEGORY,
      thumbnail
    }

    this.props.onChange(newAsset)
  }

  handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
    const { asset } = this.props

    this.props.onChange({
      ...asset,
      name: event.currentTarget.value
    })
  }

  handleGetThumbnail = async (isGround: boolean = false) => {
    const { asset } = this.props

    const mappings = rawMappingsToObjectURL(asset.contents)
    const { image } = await getModelData(mappings[asset.url], {
      mappings,
      thumbnailType: isGround ? '2d' : '3d'
    })
    revokeMappingsObjectURL(mappings)

    return image
  }

  render() {
    const { asset } = this.props
    const hasGroundCategory = isGround(asset)

    let categoryOptions = CATEGORY_OPTIONS

    if (hasGroundCategory) {
      categoryOptions = [
        ...CATEGORY_OPTIONS,
        { key: CATEGORY_OPTIONS.length + 1, text: CategoryName.GROUND_CATEGORY, value: CategoryName.GROUND_CATEGORY }
      ]
    }

    return (
      <div className="EditAsset">
        <div className="left-column">
          <img src={asset.thumbnail} className={hasGroundCategory ? 'ground' : ''} />
          <span className="metric triangles">
            <Icon name="triangles" />
            {asset.metadata.metrics.triangles} {t('metrics.triangles')}
          </span>
          <span className="metric textures">
            <Icon name="textures" />
            {asset.metadata.metrics.textures} {t('metrics.textures')}
          </span>
          <span className="metric materials">
            <Icon name="geometries" />
            {asset.metadata.metrics.materials} {t('metrics.materials')}
          </span>
        </div>
        <div className="right-column">
          <Field
            label={t('asset_pack.edit_asset.name.label')}
            placeholder={t('asset_pack.edit_asset.name.placeholder')}
            value={asset.name}
            onChange={this.handleChangeName}
          />
          <SelectField
            label={t('asset_pack.edit_asset.category.label')}
            options={categoryOptions}
            onChange={this.handleCategoryChange}
            defaultValue={CategoryName.DECORATIONS_CATEGORY}
            value={asset.category}
            disabled={hasGroundCategory}
          />
          <Radio checked={hasGroundCategory} label={t('asset_pack.edit_asset.ground.label')} onClick={this.handleToggleGround} />
          <TagField
            label={t('asset_pack.edit_asset.tags.label')}
            placeholder={t('asset_pack.edit_asset.tags.placeholder')}
            onChange={this.handleTagChange}
            value={asset.tags || []}
          />
        </div>
      </div>
    )
  }
}
