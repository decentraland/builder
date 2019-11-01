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
    const { label, entities, filter, className = '' } = this.props
    const { value } = this.state
    let options = Object.values(entities).map(entity => ({ key: entity.id, text: entity.name, value: entity.id }))

    if (filter) {
      options = options.filter(option => filter.includes(option.key))
    }

    return (
      <div className={`TextField ${className}`}>
        <span className="label">{label}</span>
        <SelectField label={label} value={value} options={options} onChange={this.handleChange} />
      </div>
    )
  }
}
