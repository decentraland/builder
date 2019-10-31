import * as React from 'react'
import { InputOnChangeData, SelectField } from 'decentraland-ui'
import { Props, State } from './EntityField.types'

export default class EntityField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || ''
  }

  handleChange = (_: any, props: InputOnChangeData) => {
    const { id, onChange } = this.props
    const { value } = props
    this.setState({ value })
    onChange(id, value)
  }

  render() {
    const { id, label, entities, className = '' } = this.props
    const { value } = this.state
    const options = Object.values(entities).map(entity => ({ key: entity.id, text: entity.name, value: entity.id }))

    return (
      <div className={`TextField ${className}`}>
        <span className="label">{label}</span>
        <SelectField id={id} label={label} value={value} options={options} onChange={(_, a) => console.log(a)} />
      </div>
    )
  }
}
