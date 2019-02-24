import * as React from 'react'
import { Header } from 'decentraland-ui'
import { Props } from './CategoryCard.types'
import './CategoryCard.css'

export default class CategoryCard extends React.PureComponent<Props> {
  handleClick = () => {
    const { category, onClick } = this.props
    onClick(category.name)
  }
  render() {
    const { category } = this.props

    if (!category || category.assets.length === 0) return null

    const { name } = category
    const asset = category.assets.find(asset => !!asset.main) || category.assets[0]
    const { thumbnail } = asset

    return (
      <div className="CategoryCard" onClick={this.handleClick}>
        <img className="thumbnail" src={thumbnail} alt={`${name} thumbnail`} />
        <Header size="small" className="title">
          {name}
        </Header>
      </div>
    )
  }
}
