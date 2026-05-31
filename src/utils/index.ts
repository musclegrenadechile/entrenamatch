export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export function calculateCompatibility(
  currentUser: any,
  profile: any,
  userLoc: { lat: number; lng: number } | null
): number {
  let score = 0

  // 1. Training Types overlap (40%)
  const typeOverlap = currentUser.trainingTypes.filter((t: string) =>
    profile.trainingTypes.includes(t)
  ).length
  const typeScore = Math.min(
    typeOverlap / Math.max(currentUser.trainingTypes.length, 1),
    1
  ) * 40
  score += typeScore

  // 2. Goals overlap (35%)
  const goalOverlap = (currentUser.goals || []).filter((g: string) =>
    profile.goals.includes(g)
  ).length
  const goalScore = Math.min(
    goalOverlap / Math.max((currentUser.goals || []).length, 1),
    1
  ) * 35
  score += goalScore

  // 3. Level proximity (15%)
  const levelMap: Record<string, number> = { Principiante: 1, Intermedio: 2, Avanzado: 3 }
  const levelDiff = Math.abs(
    levelMap[currentUser.level] - levelMap[profile.level]
  )
  const levelScore = Math.max(15 - levelDiff * 5, 0)
  score += levelScore

  // 4. Availability overlap (10%)
  const availOverlap = currentUser.availability.filter((a: string) =>
    profile.availability.includes(a)
  ).length
  const availScore = Math.min(
    availOverlap / Math.max(currentUser.availability.length, 1),
    1
  ) * 10
  score += availScore

  // 5. Intensity match bonus
  if (currentUser.intensity && profile.intensity) {
    if (currentUser.intensity === profile.intensity) {
      score += 5
    } else if (
      (currentUser.intensity === 'Moderado' && profile.intensity !== 'Intenso') ||
      (currentUser.intensity === 'Intenso' && profile.intensity === 'Moderado')
    ) {
      score += 2
    }
  }

  // 6. Distance penalty (if location available)
  if (userLoc) {
    const dist = getDistanceKm(userLoc.lat, userLoc.lng, profile.lat, profile.lng)
    if (dist > 50) score -= 15
    else if (dist > 20) score -= 8
    else if (dist > 10) score -= 3
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getTrainingStreak(reviews: any[], userId: string): number {
  const userReviews = reviews
    .filter((r: any) => r.reviewerId === userId)
    .sort((a: any, b: any) => b.timestamp - a.timestamp)

  if (userReviews.length === 0) return 0

  let streak = 1
  let lastDate = new Date(userReviews[0].timestamp)

  for (let i = 1; i < userReviews.length; i++) {
    const currentDate = new Date(userReviews[i].timestamp)
    const diffDays = Math.floor(
      (lastDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    )
    if (diffDays <= 7) {
      streak++
      lastDate = currentDate
    } else {
      break
    }
  }
  return streak
}

export function getAverageRating(reviews: any[], userId: string): number {
  const userReviews = reviews.filter((r: any) => r.reviewerId === userId)
  if (userReviews.length === 0) return 0
  const sum = userReviews.reduce((acc: number, r: any) => acc + r.rating, 0)
  return Math.round((sum / userReviews.length) * 10) / 10
}
