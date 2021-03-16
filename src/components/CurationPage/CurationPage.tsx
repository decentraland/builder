import React from 'react'
import { Row, Column, Header, Section, Container, Dropdown, Pagination, Empty } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Collection } from 'modules/collection/types'
import NotFound from 'components/NotFound'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { NavigationTab } from 'components/Navigation/Navigation.types'
import CollectionRow from './CollectionRow'
import { Props, State, SortBy } from './CurationPage.types'
import './CurationPage.css'

const PAGE_SIZE = 12

export default class CurationPage extends React.PureComponent<Props, State> {
  state: State = {
    sortBy: SortBy.ASC,
    page: 1
  }

  componentDidMount() {
    const { onFetchCollections, onFetchItems } = this.props
    onFetchCollections()
    onFetchItems()
  }

  renderSortDropdown = () => {
    const { sortBy } = this.state
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.ASC, text: t('curation_page.order.name_asc') },
          { value: SortBy.DESC, text: t('curation_page.order.name_desc') }
        ]}
        onChange={(_event, { value }) => this.setState({ sortBy: value as SortBy })}
      />
    )
  }

  paginate = () => {
    const { collections } = this.props
    const { page, sortBy } = this.state

    return collections
      .sort((a: Collection, b: Collection) => {
        switch (sortBy) {
          case SortBy.ASC: {
            return a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
          }
          case SortBy.DESC: {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          }
          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  renderPage() {
    const { collections } = this.props
    const { page } = this.state

    const total = collections.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const paginatedCollections = this.paginate()

    return (
      <>
        <div className="filters">
          <Container>
            <Row>
              <Column>
                <Row>
                  <Header sub>{t('curation_page.collections', { count: collections.length })}</Header>
                </Row>
              </Column>
              <Column align="right">
                <Row>{collections.length > 1 ? this.renderSortDropdown() : null}</Row>
              </Column>
            </Row>
          </Container>
        </div>
        <Container>
          <Section>
            {collections.length > 0 ? (
              paginatedCollections.map((collection: Collection, index) => <CollectionRow key={index} collection={collection} />)
            ) : (
              <Empty height={200}>
                <div>
                  <T id="curation_page.empty_collections" />
                </div>
              </Empty>
            )}
            {totalPages > 1 && (
              <Pagination
                firstItem={null}
                lastItem={null}
                totalPages={totalPages}
                activePage={page}
                onPageChange={(_event, props) => this.setState({ page: +props.activePage! })}
              />
            )}
          </Section>
        </Container>
      </>
    )
  }

  render() {
    const { isCommitteeMember, isConnecting, isLoading } = this.props

    return (
      <LoggedInDetailPage
        className="CurationPage"
        activeTab={NavigationTab.CURATION}
        isLoading={isConnecting || isLoading}
        isPageFullscreen={true}
      >
        {isCommitteeMember ? this.renderPage() : <NotFound />}
      </LoggedInDetailPage>
    )
  }
}
