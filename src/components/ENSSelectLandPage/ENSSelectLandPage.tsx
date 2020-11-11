import * as React from 'react'
import { Row, Column, Section, Header } from 'decentraland-ui'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import { Atlas } from 'components/Atlas'
import { Props } from './ENSSelectLandPage.types'

export default class ENSSelectLandPage extends React.PureComponent<Props> {
  render() {
    const { landTiles } = this.props
    console.log(landTiles)
    return (
      <LoggedInDetailPage className="ENSSelectLandPage">
        <Row className="main">
          <Column className="content">
            <Section>
              <Header className="title" size="large">
                Re-assign name
              </Header>
              <span className="subtitle">This is a subtitle</span>
            </Section>

            <Atlas showOwner isDraggable height={900} />
          </Column>
        </Row>
      </LoggedInDetailPage>
    )
  }
}
