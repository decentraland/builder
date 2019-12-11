import * as React from 'react'
import { Loader, Page, Container, Pagination, Tabs, Dropdown, DropdownProps, PaginationProps } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Ad from 'decentraland-ad/lib/Ad/Ad'

import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import { PoolsRequestFilters, SortBy } from 'modules/pool/types'

import SceneViewMenu from '../SceneViewPage/SceneViewMenu'
import { Props, State, filterAttributes } from './SceneListPage.types'
import PoolCard from './PoolCard'

import './SceneListPage.css'

export default class SceneListPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { onLoadPools } = this.props
    const filters = this.getFilters()
    onLoadPools(filters)
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
    if (data.value === 'all') {
      this.handleChangeFilters(filters)
    } else {
      this.handleChangeFilters({ ...filters, group: data.value as string })
    }
  }

  handleChangeUser = (_event: React.SyntheticEvent<any>, data: DropdownProps) => {
    const { userId, ...filters } = this.getFilters()
    if (data.value === 'all') {
      this.handleChangeFilters(filters)
    } else {
      this.handleChangeFilters({ ...filters, userId: data.value as string })
    }
  }

  handleChangeSort = (_event: React.SyntheticEvent<any>, data: DropdownProps) => {
    const filters = this.getFilters()
    if (data.value && filters.sortBy !== data.value) {
      this.handleChangeFilters({ ...filters, sortBy: data.value as string })
    }
  }

  handlePageChange = (_event: React.SyntheticEvent<any>, data: PaginationProps) => {
    const filters = this.getFilters()
    const newPage = Number(data.activePage)
    if (Number.isNaN(newPage) && newPage > 0) {
      this.handleChangeFilters({ ...filters, page: newPage })
    }
  }

  handleNavigateToHome = () => this.props.onNavegateToHome()

  render() {
    const { pools, poolGroups, total, totalPages, isLoggedIn } = this.props
    const filters = this.getFilters()

    return (
      <>
        <Ad slot="BUILDER_TOP_BANNER" type="full" />
        <Navbar isFullscreen rightMenu={<SceneViewMenu />} />
        <Page isFullscreen>
          <Container>
            <div className="HomePageAd">
              <Ad slot="BUILDER_HOME_PAGE" />
            </div>
          </Container>
          <div className="SceneListPage">
            <Container>
              <div className="subtitle">
                <Tabs isFullscreen>
                  <Tabs.Tab onClick={this.handleNavigateToHome}>{t('home_page.projects_title')}</Tabs.Tab>
                  <Tabs.Tab active>{t('scene_list_page.projects_title')}</Tabs.Tab>
                </Tabs>
                <div className="menu">
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
                  <Dropdown
                    direction="left"
                    value={filters.sortBy}
                    options={[
                      { value: SortBy.NEWEST, text: t('scene_list_page.filters.newest') },
                      { value: SortBy.NAME, text: t('scene_list_page.filters.name') },
                      { value: SortBy.LIKES, text: t('scene_list_page.filters.likes') },
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
