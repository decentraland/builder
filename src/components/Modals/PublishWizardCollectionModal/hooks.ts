import { useCallback, useState } from 'react'
import { getThirdPartyPrice } from 'modules/thirdParty/utils'
import { ThirdPartyPrice } from 'modules/thirdParty/types'

export type UseThirdPartyPriceResult = {
  thirdPartyPrice: ThirdPartyPrice | undefined
  isFetchingPrice: boolean
  fetchThirdPartyPrice: () => Promise<void>
}

export const useThirdPartyPrice = (): UseThirdPartyPriceResult => {
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)
  const [thirdPartyPrice, setThirdPartyPrice] = useState<ThirdPartyPrice>()

  const fetchThirdPartyPrice = useCallback(async () => {
    setIsFetchingPrice(true)
    try {
      const thirdPartyPrice = await getThirdPartyPrice()
      setThirdPartyPrice(thirdPartyPrice)
    } catch (e) {
      console.log('Error', e)
      setThirdPartyPrice(undefined)
    } finally {
      setIsFetchingPrice(false)
    }
  }, [])

  return { thirdPartyPrice, isFetchingPrice, fetchThirdPartyPrice }
}
