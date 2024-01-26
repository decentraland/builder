import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Close, Field, Icon, Loader, Message } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { ENS_RESOLVER_ADDRESS } from 'modules/common/contracts'
import { isResolverEmpty } from 'modules/ens/utils'
import ethereumImg from '../../../icons/ethereum.svg'
import { Props } from './ENSMapAddressModal.types'
import styles from './ENSMapAddressModal.module.css'

export default function EnsMapAddressModal(props: Props) {
  const { isLoading, error, ens, isLoadingSetResolver, isWaitingTxSetResolver, onUnmount, onClose, onSave, onSetENSResolver } = props
  const [address, setAddress] = useState<string>(ens.ensAddressRecord || '')

  const hasResolver = !isResolverEmpty(ens) && ens.resolver.toLowerCase() === ENS_RESOLVER_ADDRESS.toLowerCase()

  const handleSave = useCallback(() => {
    onSave(address)
  }, [address, onSave])

  const handleAddressChange = useCallback(
    (_evt, { value }) => {
      setAddress(value)
    },
    [setAddress]
  )

  const handleSetENSResolver = useCallback(() => {
    onSetENSResolver(ens)
  }, [ens, onSetENSResolver])

  useEffect(() => {
    document.getElementById('address-input')?.focus()
    return () => {
      onUnmount()
    }
  }, [onUnmount])

  const setResolverMessage = useMemo(() => {
    if (isLoadingSetResolver) {
      return (
        <span className={styles.setResolverStatus}>
          <Loader inline active size="tiny" />
          {t('ens_map_address_modal.confirm_transaction')}
        </span>
      )
    } else if (isWaitingTxSetResolver) {
      return (
        <span className={styles.setResolverStatus}>
          <Loader inline active size="tiny" />
          {t('ens_map_address_modal.processing')}
        </span>
      )
    } else if (error) {
      return (
        <span className={styles.setResolverStatus}>
          <Icon name="close" className={styles.icon} />
          {t('ens_map_address_modal.set_resolver.error')}
        </span>
      )
    }
    return null
  }, [isLoadingSetResolver, isWaitingTxSetResolver, error])

  const disableActions = isLoading || isLoadingSetResolver || isWaitingTxSetResolver

  if (!hasResolver) {
    return (
      <Modal closeIcon={disableActions ? undefined : <Close />} onClose={disableActions ? undefined : onClose} size="tiny">
        <div className={styles.main}>
          <h1>{t('ens_map_address_modal.set_resolver.title')}</h1>
          <span className={styles.setResolverInfo}>{t('ens_map_address_modal.set_resolver.info', { br: () => <br /> })}</span>
          <div className={styles.setResolverActions}>
            <Button primary onClick={handleSetENSResolver} disabled={disableActions}>
              {t('ens_map_address_modal.set_resolver.action')}
            </Button>
            {setResolverMessage}
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal closeIcon={disableActions ? undefined : <Close />} onClose={disableActions ? undefined : onClose} size="tiny">
      <div className={styles.main}>
        <div className={styles.info}>
          <h1 className={styles.title}>{t('ens_map_address_modal.title')}</h1>
          <span className={styles.description}>{t('ens_map_address_modal.description')}</span>
        </div>
        <div>
          <Field
            id="address-input"
            label={t('ens_map_address_modal.address.label')}
            value={address}
            placeholder={t('ens_map_address_modal.address.placeholder')}
            onChange={handleAddressChange}
            type="address"
            disabled={isLoading}
          />
          <div className={styles.network}>
            <span className="ui header sub">{t('ens_map_address_modal.network')}</span>
            <span className={styles.ethereum}>
              <img src={ethereumImg} alt="Ethereum" />
              {t('ens_map_address_modal.ethereum')}
            </span>
          </div>
        </div>
        {error && <Message error size="tiny" visible content={error} header={t('ens_map_address_modal.error_title')} />}
        <div className={styles.actions}>
          <Button>{t('ens_map_address_modal.learn_more')}</Button>
          <Button primary onClick={handleSave} disabled={!address || disableActions} loading={isLoading}>
            {t('ens_map_address_modal.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
