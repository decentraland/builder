import * as React from 'react'
import { Link } from 'react-router-dom'
import { Page, Tabs, Center, Loader, Table, Row, Radio, Column, Header, Pagination, Section } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import TableRow from './TableRow'
import { Props, State, LandPageView } from './LandPage.types'
import './LandPage.css'

const PAGE_SIZE = 20

export default class LandPage extends React.PureComponent<Props, State> {
  state: State = {
    showOwner: true,
    showOperator: true,
    view: LandPageView.GRID,
    page: 1
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.lands !== this.props.lands) {
      this.setState({ page: 1 })
    }
  }

  renderLogin() {
    return (
      <Center>
        <div className="secondary-text">
          You need to <Link to={locations.signIn()}>Sign In</Link> to access this page.
        </div>
      </Center>
    )
  }

  renderLoading() {
    return <Loader size="large" active />
  }

  renderLand() {
    const { lands } = this.props
    const { page } = this.state

    const totalPages = Math.ceil(lands.length / PAGE_SIZE)

    return (
      <>
        <Row height={30}>
          <Column>
            <Row>
              <Header sub>{lands.length.toLocaleString()} Results</Header>
            </Row>
          </Column>
          <Column align="right">
            <Row>
              <Radio checked={true} label="Owner" />
              <Radio checked={true} label="Operator" />
            </Row>
          </Column>
        </Row>
        <Section className="table-section">
          <Table basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Coordinates</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Operated By</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Current Scene</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {lands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(land => (
                <TableRow land={land} />
              ))}
            </Table.Body>
          </Table>
        </Section>
        {totalPages > 1 ? (
          <Section className="pagination-section">
            <Pagination
              firstItem={null}
              lastItem={null}
              activePage={page}
              onPageChange={(_event, props) => this.setState({ page: +props.activePage! })}
              totalPages={totalPages}
            ></Pagination>
          </Section>
        ) : null}
      </>
    )
  }

  render() {
    const { isLoggedIn, isLoading, onNavigate } = this.props
    return (
      <>
        <Navbar isFullscreen />
        <Tabs>
          <Tabs.Tab onClick={() => onNavigate(locations.root())}>{t('navigation.scenes')}</Tabs.Tab>
          <Tabs.Tab active>{t('navigation.land')}</Tabs.Tab>
        </Tabs>
        <Page className="LandPage">
          {!isLoggedIn ? this.renderLogin() : null}
          {isLoggedIn && isLoading ? this.renderLoading() : null}
          {isLoggedIn && !isLoading ? this.renderLand() : null}
        </Page>
        <Footer />
      </>
    )
  }
}
