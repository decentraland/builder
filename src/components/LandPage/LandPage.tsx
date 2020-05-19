import * as React from 'react'
import { Link } from 'react-router-dom'
import { Page, Tabs, Center, Loader, Table, Row, Radio, Column, Header } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import Navbar from 'components/Navbar'
import Footer from 'components/Footer'
import TableRow from './TableRow'
import { Props, State } from './LandPage.types'
import './LandPage.css'

export default class LandPage extends React.PureComponent<Props, State> {
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
    return (
      <>
        <Row height={30}>
          <Column>
            <Row>
              <Header sub>{lands.length} Results</Header>
            </Row>
          </Column>
          <Column align="right">
            <Row>
              <Radio checked={true} label="Owner" />
              <Radio checked={true} label="Operator" />
            </Row>
          </Column>
        </Row>

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
            {lands.map(land => (
              <TableRow land={land} />
            ))}
          </Table.Body>
        </Table>
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
