import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation'
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
    const { collections, isLoading, items, selectedCollectionId, totalCollections } = this.props
    const { currentPage } = this.state
    if (collections.length === 0) return null

    const totalPages = Math.ceil(totalCollections / LEFT_PANEL_PAGE_SIZE)
    return isLoading ? (
      <Loader size="small" active />
    ) : !isLoading && items.length === 0 && collections.length === 0 ? (
      <div className="empty">
        <div className="subtitle">{t('collections_page.empty_description')}</div>
      </div>
    ) : (
      <>
        <Section className="Collections">
          {collections.map(collection => (
            <SidebarCollection
              key={collection.id}
              collection={collection}
              items={items}
              isSelected={collection.id === selectedCollectionId}
            />
          ))}
          {totalPages > 1 ? (
            <Pagination
              siblingRange={0}
              firstItem={null}
              lastItem={null}
              totalPages={totalPages}
              activePage={currentPage}
              onPageChange={this.handlePageChange}
            />
          ) : null}
        </Section>
      </>
    )
  }
}
