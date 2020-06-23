import { env, envTLD } from 'dcl-ops-lib/domain'
import { buildStatic } from 'dcl-ops-lib/buildStatic'

async function main() {
  const builder = buildStatic({
    domain: `builder.decentraland.${envTLD}`,
    defaultPath: 'index.html',
    additionalDomains: env === 'prd' ? ['builder.decentraland.org'] : [],
  })

  return {
    cloudfrontDistribution: builder.cloudfrontDistribution,
    bucketName: builder.contentBucket,
  }
}
export = main
