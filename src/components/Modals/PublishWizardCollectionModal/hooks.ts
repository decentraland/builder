import { useCallback, useState } from 'react'
import { getThirdPartyPrice } from 'modules/thirdParty/utils'
import { ThirdPartyPrice } from 'modules/thirdParty/types'

export const useThirdPartyPrice = () => {
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)
  const [thirdPartyPrice, setThirdPartyPrice] = useState<ThirdPartyPrice>()

  const fetchThirdPartyPrice = useCallback(async () => {
    setIsFetchingPrice(true)
    try {
      await getThirdPartyPrice()
    } catch (e) {
      console.log('Error', e)
      setThirdPartyPrice(undefined)
    } finally {
      setIsFetchingPrice(false)
    }
  }, [])

  return { thirdPartyPrice, isFetchingPrice, fetchThirdPartyPrice }
}
