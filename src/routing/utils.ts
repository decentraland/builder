import { ItemType } from 'modules/item/types'

export type PaginationOptions = { page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }

export type CollectionDetailOptions = { tab: ItemType }

export function injectParams(location: string, keys: { [key: string]: string } = {}, options?: { [key: string]: any }) {
  if (!options) {
    return addParams(location)
  }

  const url: URL = new URL(window.location.href)
  const currentParams: URLSearchParams = url.searchParams
  const params: string[] = []
  for (const [key, param] of Object.entries(keys)) {
    const value = key in options ? options[key] : currentParams.get(param)
    switch (typeof value) {
      case 'string':
        params.push(`${param}=${value}`)
        break
      case 'number':
        if (!Number.isFinite(value)) {
          params.push(`${param}=${value}`)
        }
        break
      default:
      // ignore
    }
  }

  return addParams(location, params.join('&'))
}

export function injectPagination(location: string, options?: PaginationOptions) {
  if (!options) {
    return addParams(location)
  }

  const params = []
  if (options.page) {
    params.push(`page=${options.page}`)
  }
  if (options.sortBy) {
    params.push(`sort_by=${options.sortBy}`)
    if (options.sortOrder) {
      params.push(`sort_order=${options.sortOrder}`)
    }
  }

  return addParams(location, params.join('&'))
}

function addParams(location: string, qs: string | null = null) {
  if (qs) {
    const questionMarkPosition = location.indexOf('?')
    if (questionMarkPosition === -1) {
      location += '?' + qs
    } else if (questionMarkPosition === location.length - 1) {
      location += qs
    } else {
      location += '&' + qs
    }
  }

  return location
}

export function getValue<V>(value: string | number | null | undefined, defaultValue?: V) {
  if (value === undefined || value === null) {
    return defaultValue
  }

  return value
}

export function getPage(value: string | number | null | undefined, defaultValue = 1) {
  if (!value) {
    return defaultValue
  }

  if (typeof value === 'string') {
    value = Number(value)
  }

  if (Number.isNaN(value)) {
    return defaultValue
  }

  return Math.max(defaultValue, value)
}

export function getSortBy<V extends string>(value: string | null | undefined, values: V[], defaultValue: V) {
  if (values.includes(value as any)) {
    return value as V
  }

  return defaultValue
}

export function getSortOrder(value: string | null | undefined, defaultValue: 'desc' | 'asc' = 'desc'): 'desc' | 'asc' {
  if (!['desc', 'asc'].includes(value || '')) {
    return defaultValue
  }

  return value as 'desc' | 'asc'
}

export async function injectScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')

    script.src = url
    script.type = 'text/javascript'
    script.async = true

    document.body.appendChild(script)

    script.onload = () => resolve()
    script.onerror = () => reject(`Error loading the script: ${url}`)
  })
}
