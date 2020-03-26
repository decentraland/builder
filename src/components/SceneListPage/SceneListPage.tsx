import * as React from 'react'
import { Loader, Page, Container, Pagination, Tabs, Dropdown, DropdownProps, PaginationProps, Responsive } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
// import Ad from 'decentraland-ad/lib/Ad/Ad'

import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import { PoolsRequestFilters, SortBy, DEFAULT_POOL_GROUP } from 'modules/pool/types'

import SceneViewMenu from '../SceneViewPage/SceneViewMenu'
import { Props, State, filterAttributes } from './SceneListPage.types'
import PoolCard from './PoolCard'

import './SceneListPage.css'

export default class SceneListPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { location } = this.props
    const filters = this.getFilters()
    if (location.search === '' || location.search === '?') {
      filters.sortBy = SortBy.LIKES
      filters.sortOrder = 'desc'
      filters.group = DEFAULT_POOL_GROUP
    }

    this.handleChangeFilters(filters)
  }

  getFilters(props = this.props) {
    return filterAttributes.reduce((filters, key) => {
      if (props[key] !== undefined) {
        filters[key] = props[key]
      }
      return filters
    }, {} as PoolsRequestFilters)
  }

  handleChangeFilters(filters: PoolsRequestFilters) {
    const { onPageChange, onLoadPools } = this.props
    onPageChange(filters)
    onLoadPools(filters)
  }

  handleChangeGroup = (_event: React.SyntheticEvent<any>, data: DropdownProps) => {
    const { group, ...filters } = this.getFilters()
    const page = 1
    if (data.value === 'all') {
      this.handleChangeFilters({ ...filters, page })
    } else {
      this.handleChangeFilters({ ...filters, page, group: data.value as string })
    }
  }

  handleChangeUser = (_event: React.SyntheticEvent<any>, data: DropdownProps) => {
    const { userId, ...filters } = this.getFilters()
    const page = 1
    if (data.value === 'all') {
      this.handleChangeFilters({ ...filters, page })
    } else {
      this.handleChangeFilters({ ...filters, page, userId: data.value as string })
    }
  }

  handleChangeSort = (_event: React.SyntheticEvent<any>, data: DropdownProps) => {
    const filters = this.getFilters()
    const page = 1
    if (data.value && filters.sortBy !== data.value) {
      switch (data.value) {
        case SortBy.NAME:
          this.handleChangeFilters({ ...filters, page, sortBy: data.value as string, sortOrder: 'asc' })
          break
        default:
          this.handleChangeFilters({ ...filters, page, sortBy: data.value as string, sortOrder: 'desc' })
      }
    }
  }

  handlePageChange = (_event: React.SyntheticEvent<any>, data: PaginationProps) => {
    const filters = this.getFilters()
    const newPage = Number(data.activePage)
    if (!Number.isNaN(newPage) && newPage > 0) {
      this.handleChangeFilters({ ...filters, page: newPage })
    }
  }

  handleNavigateToHome = () => this.props.onNavegateToHome()

  render() {
    const { pools, poolGroups, total, totalPages, isLoggedIn } = this.props
    const filters = this.getFilters()

    return (
      <>
        {/* <Ad slot="BUILDER_TOP_BANNER" type="full" /> */}
        <Navbar isFullscreen rightMenu={<SceneViewMenu />} />
        <Page isFullscreen>
          <Responsive minWidth={1025} as={React.Fragment}>
            <Container>
              <div className="HomePageAd">
                {/* <Ad slot="BUILDER_HOME_PAGE" /> */}
              </div>
            </Container>
          </Responsive>
          <div className="SceneListPage">
            <Container>
              <div className="subtitle">
                <Responsive minWidth={1025} as={React.Fragment}>
                  <Tabs isFullscreen>
                    <Tabs.Tab onClick={this.handleNavigateToHome}>{t('home_page.projects_title')}</Tabs.Tab>
                    <Tabs.Tab active>{t('scene_list_page.projects_title')}</Tabs.Tab>
                  </Tabs>
                </Responsive>
                <Responsive maxWidth={1024} as={React.Fragment}>
                  <Tabs isFullscreen>
                    <Tabs.Tab active>{t('scene_list_page.projects_title')}</Tabs.Tab>
                  </Tabs>
                </Responsive>
                <div className="menu">
                  <Responsive minWidth={1025} as={React.Fragment}>
                    <Dropdown
                      direction="left"
                      value={filters.group || 'all'}
                      options={[
                        { value: 'all', text: t('scene_list_page.filters.all_groups') },
                        ...poolGroups.map(poolGroup => ({ value: poolGroup.id, text: t('scene_list_page.filters.' + poolGroup.name) }))
                      ]}
                      onChange={this.handleChangeGroup}
                    />
                    {isLoggedIn && (
                      <Dropdown
                        direction="left"
                        value={filters.userId || 'all'}
                        options={[
                          { value: 'all', text: t('scene_list_page.filters.all_users') },
                          { value: 'me', text: t('scene_list_page.filters.only_me') }
                        ]}
                        onChange={this.handleChangeUser}
                      />
                    )}
                  </Responsive>
                  <Dropdown
                    direction="left"
                    value={filters.sortBy}
                    options={[
                      { value: SortBy.NEWEST, text: t('scene_list_page.filters.newest') },
                      { value: SortBy.NAME, text: t('scene_list_page.filters.name') },
                      { value: SortBy.LIKES, text: t('scene_list_page.filters.likes') },
                      { value: SortBy.ITEMS, text: t('scene_list_page.filters.items') },
                      { value: SortBy.SMART_ITEMS, text: t('scene_list_page.filters.smart_items') },
                      { value: SortBy.SIZE, text: t('scene_list_page.filters.size') }
                    ]}
                    onChange={this.handleChangeSort}
                  />
                </div>
              </div>
              <div className="PoolCardList">
                {pools === null && <Loader active size="huge" />}
                {Array.isArray(pools) && total === 0 && <div className="empty-projects">{t('scene_list_page.no_projects')}</div>}
                {Array.isArray(pools) && total !== 0 && (
                  <>
                    {pools.map(pool => (
                      <PoolCard key={pool.id} pool={pool} />
                    ))}
                  </>
                )}
              </div>
            </Container>
            <Container>
              {total !== null && totalPages !== null && (
                <Pagination
                  firstItem={null}
                  lastItem={null}
                  totalPages={totalPages}
                  activePage={filters.page}
                  onPageChange={this.handlePageChange}
                />
              )}
            </Container>
          </div>
        </Page>
        <Footer />
      </>
    )
  }
}
