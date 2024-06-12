import * as React from 'react'
import { Row, Column, Narrow, Header, Section } from 'decentraland-ui'
import { Atlas } from 'components/Atlas'
import Back from 'components/Back'
import { locations } from 'routing/locations'
import { Props } from './LandAction.types'
import './LandAction.css'
import { withRouter } from 'react-router'

class LandAction extends React.PureComponent<Props> {
  render() {
    const { land, title, subtitle, children, history } = this.props
    return (
      <div className="LandAction">
        <Row height={48}>
          <Back absolute onClick={() => history.push(locations.landDetail(land.id))} />
        </Row>
        <Row className="main">
          <Narrow>
            <Column>
              <Atlas landId={land.id} width={240} height={240} isDraggable={false} />
            </Column>
            <Column className="content">
              {title ? (
                <Section>
                  <Header className="title" size="large">
                    {title}
                  </Header>
                  {subtitle ? <span className="subtitle">{subtitle}</span> : null}
                </Section>
              ) : null}
              {children}
            </Column>
          </Narrow>
        </Row>
      </div>
    )
  }
}

export default withRouter(LandAction)
