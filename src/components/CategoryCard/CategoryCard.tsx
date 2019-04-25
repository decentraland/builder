import * as React from 'react'
import { Header } from 'decentraland-ui'

import Icon from 'components/Icon'
import { Props } from './CategoryCard.types'
import './CategoryCard.css'

export default class CategoryCard extends React.PureComponent<Props> {
  static defaultProps = {
    special: false
  }

  handleClick = () => {
    const { category, onClick } = this.props
    onClick(category.name)
  }

  render() {
    const { category } = this.props

    if (!category) return null

    const { name, thumbnail } = category

    return (
      <div className="CategoryCard" onClick={this.handleClick}>
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title">
          {name}
        </Header>
        <Icon name="chevron-right" />
      </div>
    )
  }
}
