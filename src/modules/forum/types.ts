export type ForumPost = {
  title?: string // title is not mandatory for new posts
  raw: string
  topic_id?: number
  category?: number
  archetype?: string
  created_at?: string
}
