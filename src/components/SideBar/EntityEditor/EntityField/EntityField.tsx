import * as React from 'react'
import { SelectField, DropdownProps, Popup } from 'decentraland-ui'
import { Props, State } from './EntityField.types'
import { Asset } from 'modules/asset/types'
import './EntityField.css'

const MAX_LENGTH = 6

export default class EntityField extends React.PureComponent<Props, State> {
  state: State = {
    value: this.props.value || ''
  }

  static getDerivedStateFromProps(props: Props) {
    if (props.value) {
      return {
        value: props.value
      }
    }

    return null
  }

  handleChange = (_: any, props: DropdownProps) => {
    const { onChange } = this.props
    const value = props.value as string
    this.setState({ value })
    onChange(value)
  }

  renderTrigger = () => {
    const { assetsByEntityName } = this.props
    const { value } = this.state
    const asset = assetsByEntityName[value] as Asset | undefined

    if (!asset) {
      return (
        <span className="trigger">
          <span className="text">Select item...</span>
        </span>
      )
    }

    return (
      <span className="trigger">
        <img src={asset.thumbnail} />
        <span className="text">{value}</span>
      </span>
    )
  }

  render() {
    const { id, label, entities, filter, assetsByEntityName, className = '', direction = 'left' } = this.props
    const { value } = this.state

    let options = Object.values(entities)
      .filter(entity => !entity.disableGizmos && !!assetsByEntityName[entity.name])
      .map(entity => ({
        key: entity.name,
        text: entity.name,
        value: entity.name,
        image: { avatar: false, src: assetsByEntityName[entity.name].thumbnail }
      }))

    if (filter) {
      options = options.filter(option => filter.includes(option.key))
    }

    const content = (
      <SelectField
        id={id}
        value={value}
        options={options}
        onChange={this.handleChange}
        trigger={this.renderTrigger()}
        search={false}
        direction={direction === null ? undefined : direction}
      />
    )

    return (
      <div className={`EntityField ParameterField ${className}`} title="Item">
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}

        {value.length > MAX_LENGTH ? <Popup content={value} position="top center" trigger={content} on="hover" inverted basic /> : content}
      </div>
    )
  }
}
