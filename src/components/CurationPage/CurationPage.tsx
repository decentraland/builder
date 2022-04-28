import React from 'react'
import { Row, Column, Section, Container, Dropdown, Pagination, Empty, TextFilter, Table } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getCollectionCurationState } from 'modules/curations/collectionCuration/utils'
import Profile from 'components/Profile'
import NotFound from 'components/NotFound'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import CollectionRow from './CollectionRow'
import { Props, State, SortBy, CurationFilterOptions, CurationExtraStatuses, Filters } from './CurationPage.types'
import { CurationStatus } from 'modules/curations/types'
import './CurationPage.css'

const PAGE_SIZE = 12
const ALL_ASSIGNEES_KEY = 'all'

export default class CurationPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.MOST_RELEVANT,
    filterBy: CurationExtraStatuses.ALL_STATUS,
    assigneeFilter: ALL_ASSIGNEES_KEY,
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
          { value: SortBy.MOST_RELEVANT, text: t('curation_page.order.most_relevant') },
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
          { value: CurationFilterOptions.ALL_STATUS, text: t('curation_page.filter.all_status') },
          { value: CurationFilterOptions.UNDER_REVIEW, text: t('curation_page.filter.under_review') },
          { value: CurationFilterOptions.TO_REVIEW, text: t('curation_page.filter.to_review') },
          { value: CurationFilterOptions.APPROVED, text: t('curation_page.filter.approved') },
          { value: CurationFilterOptions.REJECTED, text: t('curation_page.filter.rejected') }
        ]}
        onChange={(_event, { value }) => this.setState({ filterBy: value as Filters })}
      />
    )
  }

  renderAssigneeFilterDropdown = () => {
    const { committeeMembers } = this.props
    const { assigneeFilter } = this.state
    return (
      <Dropdown
        direction="left"
        value={assigneeFilter}
        options={[
          { value: ALL_ASSIGNEES_KEY, text: t('curation_page.filter.all_assignees') },
          ...committeeMembers.map(address => ({ value: address, text: <Profile textOnly address={address} /> }))
        ]}
        onChange={(_event, { value }) => this.setState({ assigneeFilter: `${value}` })}
      />
    )
  }

  paginate = () => {
    const { collections, curationsByCollectionId } = this.props
    const { page, filterBy, sortBy, searchText, assigneeFilter } = this.state

    return collections
      .filter(
        collection =>
          collection.name.toLowerCase().includes(searchText.toLowerCase()) ||
          collection.owner.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter(collection => {
        const curation = curationsByCollectionId[collection.id]
        const curationState = getCollectionCurationState(collection, curation)

        switch (filterBy) {
          case CurationFilterOptions.APPROVED:
            return curationState === CurationStatus.APPROVED
          case CurationFilterOptions.REJECTED:
            return curationState === CurationStatus.REJECTED
          case CurationFilterOptions.UNDER_REVIEW:
            return curationState === CurationStatus.UNDER_REVIEW
          case CurationFilterOptions.TO_REVIEW:
            return curationState === CurationStatus.TO_REVIEW
          case CurationFilterOptions.ALL_STATUS:
          default:
            return true
        }
      })
      .filter(collection => {
        const curation = curationsByCollectionId[collection.id]
        if (assigneeFilter !== ALL_ASSIGNEES_KEY) {
          return curation && curation.assignee === assigneeFilter
        }
        return true
      })
      .sort((collectionA, collectionB) => {
        const curationA = curationsByCollectionId[collectionA.id]
        const curationB = curationsByCollectionId[collectionB.id]

        switch (sortBy) {
          case SortBy.MOST_RELEVANT: {
            const curationRelevanceOrder = [
              CurationStatus.TO_REVIEW,
              CurationStatus.UNDER_REVIEW,
              CurationStatus.APPROVED,
              CurationStatus.REJECTED,
              CurationStatus.DISABLED
            ]
            const curationAState = getCollectionCurationState(collectionA, curationA)
            const curationBState = getCollectionCurationState(collectionB, curationB)
            return curationRelevanceOrder.indexOf(curationAState) - curationRelevanceOrder.indexOf(curationBState)
          }
          case SortBy.NEWEST: {
            const dateA = curationA ? curationA.createdAt : collectionA.createdAt
            const dateB = curationB ? curationB.createdAt : collectionB.createdAt

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
                    placeholder={t('curation_page.search_placeholder', { count: collections.length })}
                    value={searchText}
                    onChange={this.handleSearchChange}
                  />
                </Row>
              </Column>
              <Column align="right">
                {collections.length > 1 ? (
                  <Row>
                    {this.renderAssigneeFilterDropdown()}
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
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('collection_row.collection')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.type')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.owner')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.date')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.status')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.assignee')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_row.discussion')}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {collections.length > 0 ? (
                  paginatedCollections.map(collection => (
                    <CollectionRow key={collection.id} collection={collection} curation={curationsByCollectionId[collection.id] || null} />
                  ))
                ) : (
                  <Empty height={200}>
                    <div>
                      <T id="curation_page.empty_collections" />
                    </div>
                  </Empty>
                )}
              </Table.Body>
            </Table>
          </Section>
          {totalPages > 1 && (
            <Pagination
              className="pagination"
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
