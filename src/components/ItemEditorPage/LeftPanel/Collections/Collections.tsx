import * as React from 'react'
import { Loader, Pagination, PaginationProps, Section } from 'decentraland-ui'
import { LEFT_PANEL_PAGE_SIZE } from 'components/ItemEditorPage/constants'
import SidebarCollection from './SidebarCollection'
import { Props, State } from './Collections.types'
import './Collections.css'

export default class Collections extends React.PureComponent<Props, State> {
  state: State = {
    currentPage: 1
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    const { onLoadPage } = this.props
    this.setState({ currentPage: +props.activePage! })
    onLoadPage(+props.activePage!)
  }

  render() {
    const { collections, isLoading, items, onSetCollection, selectedCollectionId, totalCollections } = this.props
    const { currentPage } = this.state
    if (collections.length === 0) return null

    return isLoading ? (
      <Loader size="small" active />
    ) : (
      <>
        <Section className="Collections">
          {collections.map(collection => (
            <SidebarCollection
              key={collection.id}
              collection={collection}
              items={items}
              isSelected={collection.id === selectedCollectionId}
              onSetCollection={onSetCollection}
            />
          ))}
          <Pagination
            siblingRange={0}
            firstItem={null}
            lastItem={null}
            totalPages={Math.ceil(totalCollections / LEFT_PANEL_PAGE_SIZE)}
            activePage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </Section>
      </>
    )
  }
}
