import * as React from 'react'
import {
  Loader,
  Page,
  Container,
  Pagination,
  Dropdown,
  DropdownProps,
  PaginationProps,
  Responsive,
  Row,
  Column,
  Narrow,
  Section,
  Header
} from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Footer from 'components/Footer'
import Navbar from 'components/Navbar'
import Back from 'components/Back'
import { PoolsRequestFilters, SortBy } from 'modules/pool/types'

import { Props, State, filterAttributes } from './SceneListPage.types'
import PoolCard from './PoolCard'

import './SceneListPage.css'

export default class SceneListPage extends React.PureComponent<Props, State> {
  componentDidMount() {
    const { location } = this.props
    const filters = this.getFilters()
    if (location.search === '' || location.search === '?') {
      filters.sortBy = SortBy.NEWEST
      filters.sortOrder = 'desc'
    }

    this.handleChangeFilters(filters)
  }

  getFilters(props = this.props) {
    return filterAttributes.reduce((filters, key) => {
      const value = props[key]
      if (value !== undefined) {
        filters[key] = value as any
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
    const { ethAddress, ...filters } = this.getFilters()
    const page = 1
    if (data.value === 'all') {
      this.handleChangeFilters({ ...filters, page })
    } else {
      this.handleChangeFilters({ ...filters, page, ethAddress: data.value as string })
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

  render() {
    const { pools, total, totalPages, isLoggedIn, onNavegateToHome } = this.props
    const filters = this.getFilters()

    return (
      <>
        <Navbar isFullscreen />
        <Page isFullscreen>
          <div className="SceneListPage">
            <Container>
              <Section className="navigation">
                <Row>
                  <Back absolute onClick={onNavegateToHome}></Back>
                  <Narrow>
                    <Row>
                      <Column>
                        <Row>
                          <Header size="large">{t('scene_list_page.projects_title')}</Header>
                        </Row>
                      </Column>
                      <Column align="right">
                        <Row>
                          <Responsive minWidth={1025} as={React.Fragment}>
                            {isLoggedIn && (
                              <Dropdown
                                direction="left"
                                value={filters.ethAddress || 'all'}
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
                        </Row>
                      </Column>
                    </Row>
                  </Narrow>
                </Row>
              </Section>
              <Narrow>
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
              </Narrow>
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
