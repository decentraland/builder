import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Page,
  Tabs,
  Center,
  Loader,
  Table,
  Row,
  Column,
  Header,
  Section,
  Container,
  Pagination,
  Dropdown,
  DropdownProps,
  PaginationProps
} from 'decentraland-ui'

import { Address } from 'web3x-es/address'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { Props, State } from './NamesPage.types'
import BuilderIcon from 'components/Icon'
import { SortBy } from 'modules/ui/dashboard/types'
import { PaginationOptions } from 'routing/utils'
import './NamesPage.css'
import { ENS } from 'modules/ens/types'

const PAGE_SIZE = 12

export default class NamesPage extends React.PureComponent<Props, State> {
  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  componentDidMount() {
    const { onFetchNames, address } = this.props
    if (address) {
      onFetchNames()
    }
  }

  renderSortDropdown = () => {
    const { sortBy } = this.props
    return (
      <Dropdown
        direction="left"
        value={sortBy}
        options={[
          { value: SortBy.NEWEST, text: t('home_page.sort.newest') },
          { value: SortBy.NAME, text: t('home_page.sort.name') }
        ]}
        onChange={this.handleDropdownChange}
      />
    )
  }

  handlePageChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { activePage }: PaginationProps) =>
    this.paginate({ page: activePage as number })

  handleDropdownChange = (_event: React.SyntheticEvent<HTMLElement, Event>, { value }: DropdownProps) =>
    this.paginate({ sortBy: value as SortBy })

  paginate = (options: PaginationOptions = {}) => {
    const { page, sortBy } = this.props
    this.props.onPageChange({
      page,
      sortBy,
      ...options
    })
  }

  renderLogin() {
    return (
      <Center className="login-wrapper">
        <div className="secondary-text">
          <T id="land_page.sign_in" values={{ link: <Link to={locations.signIn()}>{t('land_page.sign_in_link')}</Link> }} />
        </div>
      </Center>
    )
  }

  renderLoading() {
    return <Loader size="large" active />
  }

  renderNames() {
    const { names, totalPages, page, sortBy } = this.props
    if (!names) {
      return this.renderLoading()
    }

    const total = names.length
    const paginatedItems = names
      .sort((a: ENS, b: ENS) => {
        switch (sortBy) {
          case SortBy.NEWEST: {
            return a.address.toLowerCase() > b.address.toLowerCase() ? -1 : 1
          }
          case SortBy.NAME: {
            return a.subdomain.toLowerCase() > b.subdomain.toLowerCase() ? 1 : -1
          }
          default: {
            return 0
          }
        }
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{t('land_page.results', { count: names.length.toLocaleString() })}</Header>
                  {totalPages > 1 ? (
                    <>
                      <div className="arrow prev" onClick={() => console.log('this.handlePrev')}></div>
                      <div className="arrow next" onClick={() => console.log('this.handleNext')}></div>
                    </>
                  ) : null}
                </Row>
              </Column>
              <Column align="right">
                <Row>
                  {names.length > 1 ? this.renderSortDropdown() : null}
                  <Button basic className="create-scene" onClick={() => alert('must be implemented')}>
                    <BuilderIcon name="add-active" />
                  </Button>
                </Row>
              </Column>
            </Row>
          </Container>
        </div>
        <Container>
          <Section className="table-section">
            {names.length > 0 ? (
              <Table basic="very">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width="2">Name</Table.HeaderCell>
                    <Table.HeaderCell width="2">Being Assigned</Table.HeaderCell>
                    <Table.HeaderCell width="2">Assigned to</Table.HeaderCell>
                    <Table.HeaderCell width="2"></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedItems.map((name: ENS) => {
                    const zero = Address.ZERO.toString()
                    const beingAssigned = name.content !== zero
                    const assignedTo = beingAssigned ? name.subdomain : '--'
                    return (
                      <Table.Row className="TableRow">
                        <Table.Cell>
                          <Row>
                            <Column className="name">{name.subdomain}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="name">{beingAssigned ? 'Yes' : 'No'}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="name">{assignedTo}</Column>
                          </Row>
                        </Table.Cell>
                        <Table.Cell>
                          <Row>
                            <Column className="name">
                              {!beingAssigned ? (
                                <Button className="ui basic button" onClick={() => alert('must be implemented')}>
                                  Assign to
                                </Button>
                              ) : null}
                            </Column>
                            <Column className="name">
                              {beingAssigned ? (
                                <Button className="ui basic button" onClick={() => alert('must be implemented')}>
                                  Re-Assign
                                </Button>
                              ) : null}
                            </Column>
                          </Row>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            ) : null}
          </Section>
        </Container>
        <Container>
          {total !== null && totalPages !== null && (
            <Pagination firstItem={null} lastItem={null} totalPages={totalPages} activePage={page} onPageChange={this.handlePageChange} />
          )}
        </Container>
      </>
    )
  }

  render() {
    const { isLoggedIn, isLoading, onNavigate } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Page className={'NamesPage'} isFullscreen>
          <Tabs>
            <Tabs.Tab onClick={() => onNavigate(locations.root())}>{t('navigation.scenes')}</Tabs.Tab>
            <Tabs.Tab onClick={this.handleNavigateToLand}>{t('navigation.land')}</Tabs.Tab>
            <Tabs.Tab active>{t('navigation.names')}</Tabs.Tab>
          </Tabs>
          {!isLoggedIn ? this.renderLogin() : null}
          {isLoggedIn && isLoading ? this.renderLoading() : null}
          {isLoggedIn && !isLoading ? this.renderNames() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
