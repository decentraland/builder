import * as React from 'react'
import { Header, Dropdown } from 'decentraland-ui'

import { Props } from './SelectNames.types'
import './SelectNames.css'

const SelectNames = (props: Props) => {
  const { name, options, value, onChange } = props
  return (
    <div className="SelectNames">
      <Header sub className="name">
        {name}
      </Header>
      <Dropdown
        value={value}
        options={options}
        onChange={(_event, props) => onChange(props.value as string)}
      />
    </div>
  )
}

export default SelectNames
