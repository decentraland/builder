export type ForumPost = {
  title?: string // title is not mandatory for new posts
  raw: string
  topic_id?: number
  category?: number
  archetype?: string
  created_at?: string
}

export type ForumPostReply = {
  topic_id: string
  highest_post_number: number
  show_read_indicator: boolean
  last_read_post_number?: number
}
