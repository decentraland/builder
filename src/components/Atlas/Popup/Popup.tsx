import * as React from 'react'
import { Badge, Row, Section, Header } from 'decentraland-ui'
import { LandType } from 'modules/land/types'
import Profile from 'components/Profile'
import { Props } from './Popup.types'
import './Popup.css'

export default class Popup extends React.PureComponent<Props> {
  render() {
    const { x, y, visible, land, projects } = this.props
    return (
      <div className="Popup" style={{ top: y, left: x, opacity: visible ? 1 : 0 }}>
        <Section className="land-name">
          <Row className="name-row">
            <span className="name">{land.name}</span>
            {land.type === LandType.PARCEL ? (
              <Badge color="#37333D">
                <i className="pin" />
                {land.id}
              </Badge>
            ) : null}
          </Row>
        </Section>
        <Section className="owner">
          <Header sub>Owner</Header>
          <Profile address={land.owner} />
        </Section>

        {land.operators.length > 0 ? (
          <Section className="operators">
            <Header sub>Operators</Header>
            {land.operators.map(operator => (
              <Profile address={operator} />
            ))}
          </Section>
        ) : null}

        <Section className="online-scenes">
          <Header sub>Online Scenes</Header>
          {projects.length > 0 ? (
            projects.map(project => (
              <Row className="scene">
                {project.thumbnail ? <div className="thumbnail" style={{ backgroundImage: `url(${project.thumbnail})` }} /> : null}
                <div className="title">{project.title}</div>
              </Row>
            ))
          ) : (
            <div className="no-scenes">None</div>
          )}
        </Section>
      </div>
    )
  }
}
