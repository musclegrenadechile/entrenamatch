/**
 * Phase 398 — extract inline modals from App.tsx to mount components.
 * Run: node scripts/phase398-extract.mjs
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const appPath = path.join(root, 'src/App.tsx')
const lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/)

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n')
}

// 1. seedProfiles.ts
const seedBlock = slice(477, 627)
  .replace(/^const SEED_PROFILES/, 'export const SEED_PROFILES')
  .replace(/^const CHAT_OPENERS/, 'export const CHAT_OPENERS')
fs.mkdirSync(path.join(root, 'src/data'), { recursive: true })
fs.writeFileSync(
  path.join(root, 'src/data/seedProfiles.ts'),
  `import type { Profile } from '../types'\n\n${seedBlock}\n`
)

// Helper to extract inner content between markers (strip outer comments/AnimatePresence wrappers where noted)
function extractBlock(startLine, endLine) {
  return slice(startLine, endLine)
}

const mounts = [
  {
    file: 'src/components/home/FeedCommentsModalMount.tsx',
    phase: 398,
    name: 'FeedCommentsModalMount',
    start: 10502,
    end: 10597,
    header: `// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import type { MutableRefObject } from 'react'
import type { ProfilePost } from '../../types'

export type ViewingPostComments = {
  postId: string
  postUserId: string
  ownerName?: string
}

export type FeedCommentsModalMountProps = {
  viewingPostComments: ViewingPostComments | null
  modalCommentDraft: string
  effectiveUserId: string
  commentSubmittingRef: MutableRefObject<boolean>
  findPostInProfilePosts: (postId: string, postUserId: string) => { posts: ProfilePost[]; idx: number } | null
  getRelativeTime: (ts: number) => string
  onClose: () => void
  onLikePost: (postId: string, postUserId: string) => void
  onDeleteComment: (postId: string, postUserId: string, commentId: string) => void
  onModalCommentDraftChange: (value: string) => void
  onSubmitModalComment: () => void
}

/** Fase 398 — comentarios del muro extraídos de App.tsx. */
export function FeedCommentsModalMount({
  viewingPostComments,
  modalCommentDraft,
  effectiveUserId,
  commentSubmittingRef,
  findPostInProfilePosts,
  getRelativeTime,
  onClose,
  onLikePost,
  onDeleteComment,
  onModalCommentDraftChange,
  onSubmitModalComment,
}: FeedCommentsModalMountProps) {
  return (
`,
    footer: `  )
}
`,
    replacements: [
      ['closeFullComments', 'onClose'],
      ['likeProfilePost', 'onLikePost'],
      ['deleteCommentFromPost', 'onDeleteComment'],
      ['setModalCommentDraft', 'onModalCommentDraftChange'],
      ['submitModalComment', 'onSubmitModalComment'],
      ['onChange={e => onModalCommentDraftChange(e.target.value)}', 'onChange={e => onModalCommentDraftChange(e.target.value)}'],
    ],
  },
]

// For mounts with complex logic, write full files manually via template
console.log('Created seedProfiles.ts')
console.log('App.tsx lines before:', lines.length)
