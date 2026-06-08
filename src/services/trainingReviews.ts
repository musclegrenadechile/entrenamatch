/**
 * Training reviews — Firestore-backed (cross-device).
 * Path: trainingReviews/{reviewId}
 */

import type { Firestore } from 'firebase/firestore'
import type { TrainingReview } from '../types'

export function docToTrainingReview(docSnap: {
  id: string
  data: () => Record<string, unknown>
}): TrainingReview {
  const d = docSnap.data()
  const ts = Number(d.timestamp)
  return {
    id: docSnap.id,
    reviewerId: String(d.reviewerId || ''),
    reviewerName: String(d.reviewerName || 'Anónimo'),
    rating: Number(d.rating) || 5,
    comment: d.comment ? String(d.comment) : undefined,
    photo: d.photo ? String(d.photo) : undefined,
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    bookingId: d.bookingId ? String(d.bookingId) : undefined,
  }
}

export async function fetchReviewsForProfile(
  db: Firestore,
  profileId: string,
  limitCount = 50
): Promise<TrainingReview[]> {
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
  const q = query(
    collection(db, 'trainingReviews'),
    where('profileId', '==', profileId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(docToTrainingReview)
}

export async function submitReviewToFirestore(
  db: Firestore,
  profileId: string,
  review: Omit<TrainingReview, 'id'> & { reviewerId: string }
): Promise<string> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = await addDoc(collection(db, 'trainingReviews'), {
    profileId,
    reviewerId: review.reviewerId,
    reviewerName: review.reviewerName,
    rating: review.rating,
    comment: review.comment || null,
    photo: review.photo || null,
    timestamp: review.timestamp,
    bookingId: review.bookingId || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
