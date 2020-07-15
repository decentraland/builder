import * as React from 'react'
import { Row, Back, Column, Narrow, Header, Section } from 'decentraland-ui'
import { Atlas } from 'components/Atlas'
import { Props } from './LandAction.types'
import { locations } from 'routing/locations'
import './LandAction.css'

export default class LandAction extends React.PureComponent<Props> {
  render() {
    const { land, title, subtitle, children, onNavigate } = this.props
    return (
      <div className="LandAction">
        <Row height={48}>
          <Back absolute onClick={() => onNavigate(locations.landDetail(land.id))} />
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
