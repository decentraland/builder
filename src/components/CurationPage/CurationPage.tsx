import React from 'react'
import {
  Row,
  Column,
  Section,
  Container,
  Dropdown,
  Pagination,
  Empty,
  TextFilter,
  Table,
  DropdownProps,
  PaginationProps,
  Loader
} from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchCollectionsParams } from 'lib/api/builder'
import Profile from 'components/Profile'
import NotFound from 'components/NotFound'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import CollectionRow from './CollectionRow'
import { Props, State, CurationFilterOptions, CurationExtraStatuses, Filters } from './CurationPage.types'
import { CurationSortOptions } from 'modules/curations/types'
import './CurationPage.css'

const PAGE_SIZE = 12
const ALL_ASSIGNEES_KEY = 'all'

export default class CurationPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: CurationSortOptions.MOST_RELEVANT,
    filterBy: CurationExtraStatuses.ALL_STATUS,
    assignee: ALL_ASSIGNEES_KEY,
    searchText: '',
    page: 1
  }

  // the mount if needed if the user comes from another page and they are already connected
  componentDidMount() {
    const { onFetchCollections, wallet, isLoadingCommittee, isCommitteeMember } = this.props
    if (wallet && !isLoadingCommittee && isCommitteeMember) {
      onFetchCollections({ page: 1, limit: PAGE_SIZE, isPublished: true, sort: CurationSortOptions.MOST_RELEVANT })
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { onFetchCollections, wallet, isLoadingCommittee, isCommitteeMember } = this.props
    // fetch collections once the committee value is resolved is connected
    if (wallet && !isLoadingCommittee && isCommitteeMember && prevProps.isCommitteeMember !== isCommitteeMember) {
      onFetchCollections({ page: 1, limit: PAGE_SIZE, isPublished: true, sort: CurationSortOptions.MOST_RELEVANT })
    }
  }

  getFetchParams = (overrides?: FetchCollectionsParams) => {
    const { assignee, filterBy, page, searchText, sortBy } = this.state
    return {
      page,
      limit: PAGE_SIZE,
      assignee: assignee !== ALL_ASSIGNEES_KEY ? assignee : undefined,
      status: filterBy !== CurationExtraStatuses.ALL_STATUS ? filterBy : undefined,
      q: searchText ? searchText : undefined,
      sort: sortBy,
      isPublished: true,
      ...overrides
    }
  }

  fetchCollections = () => {
    const { onFetchCollections } = this.props
    onFetchCollections(this.getFetchParams())
  }

  updateParam = <K extends keyof State>(newState: Pick<State, K>) => {
    this.setState(newState, this.fetchCollections)
  }

  handleSortChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    this.updateParam({ sortBy: value as CurationSortOptions, page: 1 })
  }

  handleStatusChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    this.updateParam({ filterBy: `${value}` as Filters, page: 1 })
  }

  handleAssigneeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    this.updateParam({ assignee: `${value}`, page: 1 })
  }

  handleSearchChange = (value: string) => {
    const { searchText } = this.state
    if (value !== searchText) {
      this.updateParam({ searchText: value, page: 1 })
    }
  }

  handlePageChange = (_event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: PaginationProps) => {
    this.updateParam({ page: +props.activePage! })
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: CurationSortOptions.MOST_RELEVANT, text: t('curation_page.order.most_relevant') },
          { value: CurationSortOptions.NEWEST, text: t('global.order.newest') },
          { value: CurationSortOptions.NAME_ASC, text: t('global.order.name_asc') },
          { value: CurationSortOptions.NAME_DESC, text: t('global.order.name_desc') }
        ]}
        onChange={this.handleSortChange}
      />
    )
  }

  renderStatusFilterDropdown = () => {
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
        onChange={this.handleStatusChange}
      />
    )
  }

  renderAssigneeFilterDropdown = () => {
    const { committeeMembers, wallet } = this.props
    const { assignee } = this.state
    return (
      <Dropdown
        className="assignees"
        direction="left"
        value={assignee}
        options={[
          { value: ALL_ASSIGNEES_KEY, text: t('curation_page.filter.all_assignees') },
          ...committeeMembers
            .reduce((acc, member) => {
              if (member === wallet.address) {
                acc.unshift(member)
              } else {
                acc.push(member)
              }
              return acc
            }, [] as string[])
            .map(address => ({
              value: address,
              text: <Profile textOnly address={address} />
            }))
        ]}
        onChange={this.handleAssigneeChange}
      />
    )
  }

  renderPage() {
    const { isLoadingCollectionsData, isLoadingCommittee, collections, curationsByCollectionId, paginationData } = this.props
    const { page, searchText } = this.state
    const totalCurations = paginationData?.total
    const totalPages = paginationData?.totalPages
    const paginatedCollections = collections
    const isLoading = isLoadingCollectionsData || isLoadingCommittee || !paginationData

    return (
      <>
        <div className="filters">
          <Container>
            <Row>
              <Column>
                {paginationData ? (
                  <Row className="text-filter-row">
                    <TextFilter
                      placeholder={t('curation_page.search_placeholder', { count: totalCurations })}
                      value={searchText}
                      onChange={this.handleSearchChange}
                    />
                  </Row>
                ) : null}
              </Column>
              <Column align="right">
                <Row>
                  {this.renderAssigneeFilterDropdown()}
                  {this.renderStatusFilterDropdown()}
                  {this.renderSortDropdown()}
                </Row>
              </Column>
            </Row>
          </Container>
        </div>
        {isLoading ? (
          <Loader active size="large" />
        ) : (
          <Container>
            <Section>
              <Table basic="very">
                {collections.length > 0 ? (
                  <>
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
                      {paginatedCollections.map(collection => (
                        <CollectionRow
                          key={collection.id}
                          collection={collection}
                          curation={curationsByCollectionId[collection.id] || null}
                        />
                      ))}
                    </Table.Body>
                  </>
                ) : null}
              </Table>

              {collections.length === 0 ? (
                <Empty height={200}>
                  <div>
                    <T id="curation_page.empty_collections" />
                  </div>
                </Empty>
              ) : null}
            </Section>
            {!!totalPages && totalPages > 1 && (
              <Pagination
                className="pagination"
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={this.handlePageChange}
              />
            )}
          </Container>
        )}
      </>
    )
  }

  render() {
    const { isCommitteeMember, isConnecting, isLoadingCommittee } = this.props
    const isLoadingTopLevel = isConnecting || isLoadingCommittee
    return (
      <LoggedInDetailPage className="CurationPage" activeTab={NavigationTab.CURATION} isLoading={isLoadingTopLevel}>
        {isCommitteeMember ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
