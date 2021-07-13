import React from 'react'
import { Dropdown } from 'decentraland-ui'
import { preventDefault } from 'lib/preventDefault'
import { Props } from './OptionsDropdown.types'
import styles from './OptionsDropdown.module.css'

const OptionsDropdown = (props: Props) => {
  const { options, className } = props
  const classes = [styles.OptionsDropdown]
  if (classes) {
    classes.push(className)
  }

  return (
    <Dropdown className={classes.join(' ')} direction="left" onClick={preventDefault()}>
      <Dropdown.Menu>
        {options.map((option, index) => (
          <Dropdown.Item key={index} text={option.text} onClick={option.handler} />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default React.memo(OptionsDropdown)
