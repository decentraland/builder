import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Info from 'components/Info'
import { Props } from './RentalPeriod.types'
import styles from './RentalPeriod.module.css'
import { formatDistance } from 'lib/date'

export default class RentalPeriod extends React.PureComponent<Props> {
  render() {
    const { rental } = this.props

    let period: JSX.Element

    if (false && rental.endsAt.getTime() < Date.now()) {
      period = (
        <>
          <span>{t('rental_period.period_over')}</span>&nbsp;
          <Info content={t('rental_period.operator_permissions')} />
        </>
      )
    } else {
      period = (
        <>
          {t('rental_period.ends_in')} {formatDistance(new Date(Date.now() + 100000 * 1024), new Date())}
        </>
      )
    }

    return <span className={`secondary-text ${styles.wrapper}`}>{period}</span>
  }
}
