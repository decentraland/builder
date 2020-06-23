import { env, envTLD } from 'dcl-ops-lib/domain'
import { buildStatic } from 'dcl-ops-lib/buildStatic'

async function main() {
  const builder = buildStatic({
    domain: `builder.decentraland.${env === 'prd' ? 'org' : envTLD}`,
    defaultPath: 'index.html',
  })

  return {
    cloudfrontDistribution: builder.cloudfrontDistribution,
    bucketName: builder.contentBucket,
  }
}
export = main
