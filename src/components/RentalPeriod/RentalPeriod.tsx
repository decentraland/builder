import * as React from 'react'
import { formatDistance } from 'date-fns'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Info from 'components/Info'
import { hasRentalPeriodEnded } from 'modules/land/utils'
import { Props } from './RentalPeriod.types'
import styles from './RentalPeriod.module.css'

export default class RentalPeriod extends React.PureComponent<Props> {
  render() {
    const { rental } = this.props

    let period: JSX.Element

    if (hasRentalPeriodEnded(rental)) {
      period = (
        <>
          <span>{t('rental_period.period_over')}</span>&nbsp;
          <Info content={t('rental_period.operator_permissions')} />
        </>
      )
    } else {
      period = (
        <>
          {t('rental_period.ends_in')} {formatDistance(rental.endsAt, new Date())}
        </>
      )
    }

    return <span className={`secondary-text ${styles.wrapper}`}>{period}</span>
  }
}
