import { useCallback, useEffect, useState } from 'react'
import { Button, Close, Field, Message } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import ethereumImg from '../../../icons/ethereum.svg'
import { Props } from './ENSMapAddressModal.types'
import styles from './ENSMapAddressModal.module.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

export default function EnsMapAddressModal(props: Props) {
  const { isLoading, error, onClose, onSave } = props
  const [address, setAddress] = useState<string>('')

  const handleSave = useCallback(() => {
    onSave(address)
  }, [address, onSave])

  const handleAddressChange = useCallback(
    (_evt, { value }) => {
      setAddress(value)
    },
    [setAddress]
  )

  useEffect(() => {
    document.getElementById('address-input')?.focus()
  }, [])

  return (
    <Modal closeIcon={<Close />} onClose={onClose} size="tiny">
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
          <Button primary onClick={handleSave} disabled={!address || isLoading} loading={isLoading}>
            {t('ens_map_address_modal.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
