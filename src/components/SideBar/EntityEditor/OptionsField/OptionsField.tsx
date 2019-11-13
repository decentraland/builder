import * as React from 'react'
import { SelectField, DropdownProps } from 'decentraland-ui'
import { Props } from './OptionsField.types'
import './OptionsField.css'

export default class OptionsField extends React.PureComponent<Props> {
  handleChange = (_: any, props: DropdownProps) => {
    const { onChange } = this.props
    const value = props.value as string
    onChange(value)
  }

  render() {
    const { label, options, className = '', value } = this.props
    let selectOptions = options.map(opt => ({ key: opt.value, text: opt.label, value: opt.value }))

    return (
      <div className={`OptionsField ParameterField ${className}`}>
        {label && <span className="label">{label}</span>}
        <SelectField value={value} options={selectOptions} onChange={this.handleChange} />
      </div>
    )
  }
}
