import * as React from 'react'
import { Dropdown, DropdownItemProps, DropdownProps, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getContentsStorageUrl } from 'lib/api/builder'
import { Props } from './ItemDropdown.types'
import './ItemDropdown.css'

export default class ItemDropdown extends React.PureComponent<Props> {
  getOptions() {
    const { items, filter } = this.props
    const filteredItems = filter ? items.filter(filter) : items
    const options: DropdownItemProps[] = []
    for (const item of filteredItems) {
      options.push({
        value: item.id,
        text: item.name,
        image: getContentsStorageUrl(item.contents[item.thumbnail])
      })
    }
    return options
  }

  handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, props: DropdownProps) => {
    const { items, onChange } = this.props
    const item = items.find(item => item.id === props.value)
    if (item) {
      onChange(item)
    }
  }

  renderTrigger(options: DropdownItemProps[]) {
    const { value, placeholder } = this.props
    return value ? (
      <Row className="selected-item">
        <img src={getContentsStorageUrl(value.contents[value.thumbnail])} />
        <div className="name">{value.name}</div>
      </Row>
    ) : options.length > 0 ? (
      <p className="placeholder">{placeholder ? placeholder : <>{t('item_dropdown.placeholder')}&hellip;</>}</p>
    ) : (
      <p className="no-items">{t('item_dropdown.no_items')}</p>
    )
  }

  render() {
    const { isDisabled } = this.props
    const options = this.getOptions()
    return (
      <Dropdown
        className="ItemDropdown"
        trigger={this.renderTrigger(options)}
        inline
        direction="right"
        options={options}
        onChange={this.handleChange}
        scrolling={options.length > 4}
        disabled={isDisabled || options.length <= 0}
      />
    )
  }
}
