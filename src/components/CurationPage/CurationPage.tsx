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
  Loader,
  Radio,
  CheckboxProps,
  Header
} from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { FetchCollectionsParams } from 'lib/api/builder'
import Profile from 'components/Profile'
import NotFound from 'components/NotFound'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import CollectionRow from './CollectionRow'
import {
  Props,
  State,
  CurationFilterOptions,
  CurationExtraStatuses,
  CurationStatuses,
  CollectionTypes,
  CollectionExtraTypes,
  CollectionFilterOptions
} from './CurationPage.types'
import { CurationSortOptions } from 'modules/curations/types'
import './CurationPage.css'

const PAGE_SIZE = 12
const ALL_ASSIGNEES_KEY = 'all'
const CAMPAIGN_TAG = 'DCLMF23'

export default class CurationPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: CurationSortOptions.CREATED_AT_DESC,
    filterByStatus: CurationExtraStatuses.ALL_STATUS,
    filterByTags: [],
    filterByType: CollectionExtraTypes.ALL_TYPES,
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
    const { assignee, filterByStatus, filterByType, page, searchText, sortBy, filterByTags } = this.state
    return {
      page,
      limit: PAGE_SIZE,
      assignee: assignee !== ALL_ASSIGNEES_KEY ? assignee : undefined,
      status: filterByStatus !== CurationExtraStatuses.ALL_STATUS ? filterByStatus : undefined,
      type: filterByType !== CollectionExtraTypes.ALL_TYPES ? filterByType : undefined,
      q: searchText ? searchText : undefined,
      sort: sortBy,
      tag: filterByTags.length > 0 ? filterByTags : undefined,
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
    this.updateParam({ filterByStatus: `${value as unknown as string}` as CurationStatuses, page: 1 })
  }

  handleTypeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    this.updateParam({ filterByType: `${value as unknown as string}` as CollectionTypes, page: 1 })
  }

  handleAssigneeChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) => {
    this.updateParam({ assignee: `${value as unknown as string}`, page: 1 })
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

  handleOnCampaignToggleChange = (_event: React.FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps) => {
    const { checked } = checkboxProps
    if (checked) {
      this.updateParam({ filterByTags: [...this.state.filterByTags, CAMPAIGN_TAG] })
    } else {
      this.updateParam({ filterByTags: [...this.state.filterByTags.filter(tag => tag !== CAMPAIGN_TAG)] })
    }
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: CurationSortOptions.MOST_RELEVANT, text: t('curation_page.order.most_relevant') },
          {
            value: CurationSortOptions.CREATED_AT_DESC,
            text: t('global.order.newest')
          },
          { value: CurationSortOptions.NAME_ASC, text: t('global.order.name_asc') },
          { value: CurationSortOptions.NAME_DESC, text: t('global.order.name_desc') }
        ]}
        onChange={this.handleSortChange}
      />
    )
  }

  renderTypesFilterDropdown = () => {
    const { filterByType } = this.state
    return (
      <Dropdown
        direction="left"
        value={filterByType}
        options={[
          { value: CollectionExtraTypes.ALL_TYPES, text: t('curation_page.filter.all_types') },
          { value: CollectionFilterOptions.STANDARD, text: t('curation_page.filter.standard') },
          { value: CollectionFilterOptions.THIRD_PARTY, text: t('curation_page.filter.third_party') }
        ]}
        onChange={this.handleTypeChange}
      />
    )
  }

  renderStatusFilterDropdown = () => {
    const { filterByStatus } = this.state
    return (
      <Dropdown
        direction="left"
        value={filterByStatus}
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

  renderCampaignFilterToggle = () => {
    const { filterByTags } = this.state
    return (
      <Radio
        toggle
        className="filterByCampaignTag"
        checked={filterByTags.includes(CAMPAIGN_TAG)}
        onChange={this.handleOnCampaignToggleChange}
        label={t('campaign.name')}
      />
    )
  }

  renderPage() {
    const { isLoadingCollectionsData, isLoadingCommittee, collections, curationsByCollectionId, paginationData, isCampaignEnabled } =
      this.props
    const { page, searchText } = this.state
    const totalCurations = paginationData?.total
    const totalPages = paginationData?.totalPages
    const paginatedCollections = collections
    const isLoading = isLoadingCollectionsData || isLoadingCommittee || !paginationData

    return (
      <>
        <div className="filters">
          <Container>
            {paginationData ? (
              <Row className="text-filter-row">
                <TextFilter placeholder={t('curation_page.search_placeholder')} value={searchText} onChange={this.handleSearchChange} />
              </Row>
            ) : null}
            <Row>
              <Column grow={false} shrink={false}>
                <Row>
                  {!isLoadingCollectionsData && !!totalCurations && totalCurations > 0 && (
                    <Header sub>{t('collections_page.results', { count: totalCurations })}</Header>
                  )}
                </Row>
              </Column>
              <Column align="right" shrink={false}>
                <Row>
                  {isCampaignEnabled ? this.renderCampaignFilterToggle() : null}
                  {this.renderAssigneeFilterDropdown()}
                  {this.renderTypesFilterDropdown()}
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
