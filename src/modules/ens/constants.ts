// Pinned ENS deployment artifacts include source/constructor metadata for these non-proxy resolvers.
// Both setters enforce PublicResolver.isAuthorised (owner, wrapper owner, approved delegate/operator,
// or ENS's trusted controller/reverse registrar); read-interface claims alone are never trusted.
// Mainnet 231b: ensdomains/ens-contracts@1a2ac5cb2b4aec511a90fc1366c231e76fcec8dc/deployments/mainnet/PublicResolver.json
// Mainnet F291 / Sepolia E996: ensdomains/ens-contracts@8aa3392e59e50d0aeb53a43cd19038bb6a2ad0a2/deployments/{mainnet,sepolia}/PublicResolver.json
export const PUBLIC_RESOLVERS_BY_CHAIN: Record<number, readonly string[]> = {
  1: ['0x231b0ee14048e9dccd1d247744d114a4eb5e8e63', '0xf29100983e058b709f3d539b0c765937b804ac15'],
  11155111: ['0xe99638b40e4fff0129d56f03b55b6bbc4bbe49b5']
}
