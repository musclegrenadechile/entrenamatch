/**
 * EntrenaPlan — weekly workout recommendations (rules + optional Gemini).
 */

import type { Firestore } from 'firebase/firestore'
import type { WeeklyPlanResult } from '../domain/weeklyPlan'

const WEEKLY_PLAN_AI_FLAG = import.meta.env.VITE_WEEKLY_PLAN_AI === '1'
const RATE_KEY = 'entrenamatch_weekly_plan_ai_last'

export function isWeeklyPlanAiEnabled(): boolean {
  return WEEKLY_PLAN_AI_FLAG
}

function canCallWeeklyPlanAi(): boolean {
  try {
    const last = Number(localStorage.getItem(RATE_KEY) || 0)
    return Date.now() - last > 20 * 60 * 60 * 1000
  } catch {
    return true
  }
}

function markWeeklyPlanAiCalled(): void {
  try {
    localStorage.setItem(RATE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export type RecommendPlanAiResult = {
  headline?: string
  detail?: string
  nutritionNote?: string
  source: 'ai' | 'rules'
}

export async function enrichWeeklyPlanWithAi(
  plan: WeeklyPlanResult
): Promise<WeeklyPlanResult> {
  if (!WEEKLY_PLAN_AI_FLAG || !canCallWeeklyPlanAi()) return plan

  try {
    const { app: firebaseApp } = await import('./firebase')
    if (!firebaseApp) return plan
    const { getFunctions, httpsCallable } = await import('firebase/functions')
    const functions = getFunctions(firebaseApp, 'us-central1')
    const fn = httpsCallable<{ plan: WeeklyPlanResult }, RecommendPlanAiResult>(
      functions,
      'recommendPlan'
    )
    const res = await fn({ plan })
    markWeeklyPlanAiCalled()
    const data = res.data
    if (!data || data.source !== 'ai') return plan
    return {
      ...plan,
      headline: data.headline?.trim() || plan.headline,
      detail: data.detail?.trim() || plan.detail,
      nutritionNote: data.nutritionNote?.trim() || plan.nutritionNote,
      source: 'ai',
    }
  } catch (e) {
    console.warn('enrichWeeklyPlanWithAi failed', e)
    return plan
  }
}

export async function saveWeeklyPlanCache(
  db: Firestore,
  userId: string,
  plan: WeeklyPlanResult
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const id = `${userId}_${plan.weekKey}`
  await setDoc(
    doc(db, 'weeklyPlans', id),
    {
      userId,
      weekKey: plan.weekKey,
      scenario: plan.scenario,
      headline: plan.headline,
      recommendation: plan.recommendation,
      generatedAt: plan.generatedAt,
      source: plan.source,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function buildWeeklyPlanNotificationBody(plan: WeeklyPlanResult): string {
  const rec = plan.recommendation
  return `${plan.headline} — ${rec.title}, ${rec.durationMin} min. Abre Hoy para ver el plan completo.`
}
