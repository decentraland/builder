import formatDistanceToNowI18n from 'date-fns/formatDistanceToNow'
import formatDistanceI18n from 'date-fns/formatDistance'
import en from 'date-fns/locale/en-US'
import { formatDistanceToNow, formatDistance } from './date'

jest.mock('date-fns/formatDistanceToNow')
jest.mock('date-fns/formatDistance')

const mockFormatDistanceToNow = formatDistanceToNowI18n as jest.Mock
const mockFormatDistance = formatDistanceI18n as jest.Mock

afterEach(() => jest.resetAllMocks())

describe('when formatting the date distance to now', () => {
  it('should call the base function using the current locale as an option', () => {
    const date = new Date()

    formatDistanceToNow(date)
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(date, { locale: en })
  })

  it('should forward the other options aswell', () => {
    const date = new Date()
    const options = { includeSeconds: true, addSuffix: true }

    formatDistanceToNow(date, options)
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(date, { ...options, locale: en })
  })
})

describe('when formatting the date distance', () => {
  it('should call the base function using the current locale as an option', () => {
    const date = new Date()
    const baseDate = new Date()

    formatDistance(date, baseDate)
    expect(mockFormatDistance).toHaveBeenCalledWith(date, baseDate, { locale: en })
  })

  it('should forward the other options aswell', () => {
    const date = new Date()
    const baseDate = new Date()
    const options = { includeSeconds: true, addSuffix: true }

    formatDistance(date, baseDate, options)
    expect(mockFormatDistance).toHaveBeenCalledWith(date, baseDate, { ...options, locale: en })
  })
})
