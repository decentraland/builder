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
import { RoleType } from 'modules/land/types'

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
    const { page, showOwner, showOperator } = this.state

    const filteredLands = lands.filter(land => {
      if (showOwner && land.role === RoleType.OWNER) {
        return true
      }
      if (showOperator && land.role === RoleType.OPERATOR) {
        return true
      }
      return false
    })

    const totalPages = Math.ceil(filteredLands.length / PAGE_SIZE)

    return (
      <>
        <Row height={30}>
          <Column>
            <Row>
              <Header sub>{filteredLands.length.toLocaleString()} Results</Header>
            </Row>
          </Column>
          <Column align="right">
            <Row>
              <Radio value="owner" checked={showOwner} onClick={() => this.setState({ showOwner: !showOwner })} label="Owner" />
              <Radio
                value="operator"
                checked={showOperator}
                onClick={() => this.setState({ showOperator: !showOperator })}
                label="Operator"
              />
            </Row>
          </Column>
        </Row>
        <Section className="table-section">
          {filteredLands.length > 0 ? (
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
                {filteredLands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(land => (
                  <TableRow land={land} />
                ))}
              </Table.Body>
            </Table>
          ) : null}
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
