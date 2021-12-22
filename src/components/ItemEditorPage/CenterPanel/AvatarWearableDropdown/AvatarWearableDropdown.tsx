import React from 'react'
import { Dropdown, DropdownItemProps, DropdownProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getName, getWearables } from 'modules/editor/utils'
import { Props } from './AvatarWearableDropdown.types'

export default class AvatarWearableDropdown extends React.PureComponent<Props> {
  handleAvatarChangeWearable = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const { wearable, category, bodyShape, onChange, baseWearables } = this.props
    const newWearable = data.value ? baseWearables.find(wearable => wearable.id === data.value) : null
    if (wearable !== newWearable) {
      onChange(category, bodyShape, newWearable ?? null)
    }
  }

  render() {
    const { wearable, bodyShape, category, label, isNullable, baseWearables } = this.props
    const options: DropdownItemProps[] = getWearables(baseWearables, category, bodyShape).map(wearable => ({
      value: wearable.id,
      text: getName(wearable)
    }))
    if (isNullable) {
      options.push({ value: '', text: t('global.none') })
    }
    const selected = wearable ? options.find(option => option.value === wearable.id) : null
    return (
      <Dropdown
        inline
        direction="right"
        className="AvatarWearableDropdown Select"
        value={wearable ? wearable.id : ''}
        options={options}
        scrolling
        onChange={this.handleAvatarChangeWearable}
        trigger={
          <>
            <div className="label">{label}</div>
            <div className="value">{selected ? selected.text : t('global.none')}</div>
            <div className="handle" />
          </>
        }
      ></Dropdown>
    )
  }
}
