import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button, Page, Tabs, Center, Loader, Table, Row, Column, Header, Section, Container, Pagination } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import { Props, State } from './NamesPage.types'
import BuilderIcon from 'components/Icon'
import './NamesPage.css'

const PAGE_SIZE = 20

export default class NamesPage extends React.PureComponent<Props, State> {
  state: State = {
    page: 1
  }

  handleNavigateToLand = () => this.props.onNavigate(locations.land())

  componentDidMount() {
    const { onFetchNames, address } = this.props
    console.log('Address from componentDidMount:', address)
    if (address) {
      onFetchNames(address)
    }
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

  renderLand() {
    const { names } = this.props
    if (!names) {
      return this.renderLoading()
    }

    const total = names.length
    const totalPages = Math.ceil(names.length / PAGE_SIZE)
    const { page } = this.state

    const paginatedItems = names.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return (
      <>
        <div className="filters">
          <Container>
            <Row height={30}>
              <Column>
                <Row>
                  <Header sub>{t('land_page.results', { count: names.length.toLocaleString() })}</Header>
                  {names.length > 1 ? (
                    <>
                      <div className="arrow prev" onClick={() => console.log('this.handlePrev')}></div>
                      <div className="arrow next" onClick={() => console.log('this.handleNext')}></div>
                    </>
                  ) : null}
                </Row>
              </Column>
              <Column align="right">
                <Row>
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
                  {paginatedItems.map(name => (
                    <Table.Row className="TableRow">
                      <Table.Cell>
                        <Row>
                          <Column className="name">{name.name}</Column>
                        </Row>
                      </Table.Cell>
                      <Table.Cell>
                        <Row>
                          <Column className="name">{name.beingAssigned ? 'Yes' : 'No'}</Column>
                        </Row>
                      </Table.Cell>
                      <Table.Cell>
                        <Row>
                          <Column className="name">{name.assignedTo}</Column>
                        </Row>
                      </Table.Cell>
                      <Table.Cell>
                        <Row>
                          <Column className="name">
                            <Button onClick={() => alert('must be implemented')}> Assign to </Button>
                          </Column>
                          <Column className="name">
                            <Button onClick={() => alert('must be implemented')}> Re-Assign </Button>
                          </Column>
                        </Row>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : null}
          </Section>
        </Container>
        <Container>
          {total !== null && totalPages !== null && (
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
          {isLoggedIn && !isLoading ? this.renderLand() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
