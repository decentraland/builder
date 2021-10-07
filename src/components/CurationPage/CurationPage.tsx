import React from 'react'
import { Row, Column, Section, Container, Dropdown, Pagination, Empty, TextFilter } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { hasReviews } from 'modules/collection/utils'
import NotFound from 'components/NotFound'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import CollectionRow from './CollectionRow'
import { Props, State, SortBy, FilterBy } from './CurationPage.types'
import './CurationPage.css'

const PAGE_SIZE = 12

export default class CurationPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.NEWEST,
    filterBy: FilterBy.ALL_STATUS,
    searchText: '',
    page: 1
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.NEWEST, text: t('global.order.newest') },
          { value: SortBy.NAME_ASC, text: t('global.order.name_asc') },
          { value: SortBy.NAME_DESC, text: t('global.order.name_desc') }
        ]}
        onChange={(_event, { value }) => this.setState({ sortBy: value as SortBy })}
      />
    )
  }

  renderFilterDropdown = () => {
    const { filterBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={filterBy}
        options={[
          { value: FilterBy.ALL_STATUS, text: t('curation_page.filter.all_status') },
          { value: FilterBy.NOT_REVIWED, text: t('curation_page.filter.not_reviewed') },
          { value: FilterBy.APPROVED, text: t('curation_page.filter.approved') },
          { value: FilterBy.REJECTED, text: t('curation_page.filter.rejected') }
        ]}
        onChange={(_event, { value }) => this.setState({ filterBy: value as FilterBy })}
      />
    )
  }

  paginate = () => {
    const { collections, curationsByCollectionId } = this.props
    const { page, filterBy, sortBy, searchText } = this.state

    return collections
      .filter(
        collection =>
          collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
          collection.owner.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter(collection => {
        const curation = curationsByCollectionId[collection.id]

        switch (filterBy) {
          case FilterBy.APPROVED: {
            return !curation && collection.isApproved
          }
          case FilterBy.REJECTED: {
            return hasReviews(collection) && !collection.isApproved
          }
          case FilterBy.NOT_REVIWED: {
            return curation || !hasReviews(collection)
          }
          case FilterBy.ALL_STATUS:
          default: {
            return true
          }
        }
      })
      .sort((collectionA, collectionB) => {
        const curationA = curationsByCollectionId[collectionA.id]
        const curationB = curationsByCollectionId[collectionB.id]

        switch (sortBy) {
          case SortBy.NEWEST: {
            const dateA = curationA ? curationA.created_at : collectionA.createdAt
            const dateB = curationB ? curationB.created_at : collectionB.createdAt

            return dateA < dateB ? 1 : -1
          }
          case SortBy.NAME_ASC: {
            return collectionA.name.toLowerCase() < collectionB.name.toLowerCase() ? 1 : -1
          }
          case SortBy.NAME_DESC: {
            return collectionA.name.toLowerCase() > collectionB.name.toLowerCase() ? 1 : -1
          }

          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  handleSearchChange = (value: string): void => {
    this.setState({ searchText: value })
  }

  renderPage() {
    const { collections, curationsByCollectionId } = this.props
    const { page, searchText } = this.state

    const total = collections.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedCollections = this.paginate()

    return (
      <>
        <div className="filters">
          <Container>
            <Row>
              <Column>
                <Row className="text-filter-row">
                  <TextFilter
                    value={searchText}
                    onChange={this.handleSearchChange}
                    placeholder={t('curation_page.search_placeholder', { count: collections.length })}
                  />
                </Row>
              </Column>
              <Column align="right">
                {collections.length > 1 ? (
                  <Row>
                    {this.renderFilterDropdown()}
                    {this.renderSortDropdown()}
                  </Row>
                ) : null}
              </Column>
            </Row>
          </Container>
        </div>
        <Container>
          <Section>
            {collections.length > 0 ? (
              paginatedCollections.map((collection, index) => (
                <CollectionRow key={index} collection={collection} curation={curationsByCollectionId[collection.id] || null} />
              ))
            ) : (
              <Empty height={200}>
                <div>
                  <T id="curation_page.empty_collections" />
                </div>
              </Empty>
            )}
          </Section>
          {totalPages > 1 && (
            <Pagination
              firstItem={null}
              lastItem={null}
              totalPages={totalPages}
              activePage={page}
              onPageChange={(_event, props) => this.setState({ page: +props.activePage! })}
            />
          )}
        </Container>
      </>
    )
  }

  render() {
    const { isCommitteeMember, isConnecting, isLoading } = this.props

    return (
      <LoggedInDetailPage className="CurationPage" activeTab={NavigationTab.CURATION} isLoading={isConnecting || isLoading}>
        {isCommitteeMember ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
