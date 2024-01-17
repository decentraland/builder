import * as React from 'react'
import { Button, Page, List, Container } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Footer from 'components/Footer'
import Navbar from 'components/Navbar'

import { Props, State } from './MobilePage.types'
import './MobilePage.css'

export default class MobilePage extends React.PureComponent<Props, State> {
  componentDidMount() {
    document.body.classList.add('mobile-body')
  }

  componentWillUnmount() {
    document.body.classList.remove('mobile-body')
  }

  render() {
    return (
      <>
        <Navbar />
        <Page isFullscreen className="MobilePage">
          <Container>
            <div className="slot-image" />
            <h2>{t('mobile_page.title')}</h2>
            <span>{t('mobile_page.list_title')}</span>
            <List>
              <List.Item>
                <div className="icon dress-icon" />
                <List.Content
                  content={t('mobile_page.first_paragraph', { bold_text: <b>{t('mobile_page.first_paragraph_bold_text')}</b> })}
                />
              </List.Item>
              <List.Item>
                <div className="icon tools-icon" />
                <List.Content
                  content={t('mobile_page.second_paragraph', { bold_text: <b>{t('mobile_page.second_paragraph_bold_text')}</b> })}
                />
              </List.Item>
              <List.Item>
                <div className="icon landscape-icon" />
                <List.Content
                  content={t('mobile_page.third_paragraph', { bold_text: <b>{t('mobile_page.third_paragraph_bold_text')}</b> })}
                />
              </List.Item>
              <List.Item>
                <div className="icon cat-icon" />
                <List.Content
                  content={t('mobile_page.fourth_paragraph', { bold_text: <b>{t('mobile_page.fourth_paragraph_bold_text')}</b> })}
                />
              </List.Item>
            </List>
            <Button
              inverted
              primary
              as="a"
              href="https://docs.decentraland.org/creator"
              rel="noopener noreferrer"
              target="_blank"
              content={t('global.learn_more')}
            />
          </Container>
        </Page>
        <Footer />
      </>
    )
  }
}
