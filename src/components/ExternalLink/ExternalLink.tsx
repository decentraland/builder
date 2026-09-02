import { getSafeExternalUrl } from 'lib/url'
import { Props } from './ExternalLink.types'

/**
 * Renders a link to an external site, always opening it in a new tab without sharing the current context.
 * Renders without a destination when the url is not a safe external url.
 */
export default function ExternalLink({ href, ...rest }: Props) {
  return <a {...rest} href={getSafeExternalUrl(href)} target="_blank" rel="noopener noreferrer" />
}
