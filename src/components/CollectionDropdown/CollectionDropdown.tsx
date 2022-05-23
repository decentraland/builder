import * as React from 'react'
import { Dropdown, DropdownItemProps, DropdownProps, Row } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Props } from './CollectionDropdown.types'
import './CollectionDropdown.css'

export default class CollectionDropdown extends React.PureComponent<Props> {
  componentDidMount() {
    const { address, onFetchCollections } = this.props
    if (address) {
      onFetchCollections(address)
    }
  }

  getOptions() {
    const { collections, filter } = this.props
    const filteredCollections = filter ? collections.filter(filter) : collections
    const options: DropdownItemProps[] = []
    for (const collection of filteredCollections) {
      options.push({
        value: collection.id,
        text: collection.name
      })
    }
    return options
  }

  handleChange = (_event: React.SyntheticEvent<HTMLElement, Event>, props: DropdownProps) => {
    const { collections, onChange } = this.props
    const collection = collections.find(collection => collection.id === props.value)
    if (collection) {
      onChange(collection)
    }
  }

  renderTrigger(options: DropdownItemProps[]) {
    const { value, placeholder } = this.props
    return value ? (
      <Row className="selected-item">
        <div className="name">{value.name}</div>
      </Row>
    ) : options.length > 0 ? (
      <p className="placeholder">{placeholder ? placeholder : <>{t('collection_dropdown.placeholder')}&hellip;</>}</p>
    ) : (
      <p className="no-items">{t('collection_dropdown.no_collections')}</p>
    )
  }

  render() {
    const { isDisabled } = this.props
    const options = this.getOptions()
    return (
      <Dropdown
        className="CollectionDropdown"
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
