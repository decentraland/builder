import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { Props, State } from './EntityField.types'

export default class EntityField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || ''
  }

  handleChange = (_: any, props: DropdownProps) => {
    const { onChange } = this.props
    const value = props.value as string
    this.setState({ value })
    onChange(value)
  }

  render() {
    const { label, entities, filter, assetsByEntityName, className = '' } = this.props
    const { value } = this.state

    let options = Object.values(entities)
      .filter(entity => !entity.disableGizmos)
      .map(entity => ({
        key: entity.name,
        text: entity.name,
        value: entity.name,
        image: { avatar: false, src: assetsByEntityName[entity.name].thumbnail }
      }))

    if (filter) {
      options = options.filter(option => filter.includes(option.key))
    }

    return (
      <div className={`EntityField ${className}`}>
        <span className="label">{label}</span>
        <SelectField value={value} options={options} onChange={this.handleChange} />
      </div>
    )
  }
}
