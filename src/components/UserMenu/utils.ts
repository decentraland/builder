export function getFaceUrl(userId: string, cacheBust = false) {
  return `https://s3.amazonaws.com/avatars-storage.decentraland.org/${escape(userId)}/face.png?cache-bust=${cacheBust ? Date.now() : false}`
}
