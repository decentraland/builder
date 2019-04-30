import React from 'react'

import SidebarCard from '../SidebarCard'
import { Props } from './CategoryList.types'

export default class CategoryList extends React.PureComponent<Props> {
  render() {
    const { categories, onSelectCategory } = this.props
    return categories.map(category => (
      <SidebarCard
        key={`category-${category.name}`}
        id={category.name}
        title={category.name}
        thumbnail={category.thumbnail}
        onClick={onSelectCategory}
        isVisible={category.assets.length > 0}
      />
    ))
  }
}
