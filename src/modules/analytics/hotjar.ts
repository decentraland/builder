import { env } from 'decentraland-commons'
import { isProduction } from 'lib/environment'

const HOTJAR_ID = parseInt(env.get('REACT_APP_HOTJAR_ID', ''), 10)

if (isProduction && HOTJAR_ID) {
  const hotjarWindow = window as any
  hotjarWindow.h._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 }

  // prettier-ignore
  // @ts-ignore
  // tslint:disable-next-line
  const hotjar = function(a,c,e,f,d,b){a.hj=a.hj||function(){(a.hj.q=a.hj.q||[]).push(arguments)};d=c.getElementsByTagName("head")[0];b=c.createElement("script");b.async=1;b.src=e+a._hjSettings.hjid+f+a._hjSettings.hjsv;d.appendChild(b)}

  // @ts-ignore
  hotjar(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
}
