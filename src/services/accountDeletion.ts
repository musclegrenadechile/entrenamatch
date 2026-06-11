import { getFunctions, httpsCallable } from 'firebase/functions'

export type DeleteMyAccountReason =
  | 'not_useful'
  | 'privacy'
  | 'bugs'
  | 'empty'
  | 'other'
  | ''

export async function deleteMyAccount(params: {
  confirmPhrase: string
  reason?: DeleteMyAccountReason
}): Promise<{ ok: boolean; message?: string }> {
  const fn = getFunctions()
  const call = httpsCallable<
    { confirmPhrase: string; reason?: string },
    { ok: boolean; message?: string }
  >(fn, 'deleteMyAccount')
  const res = await call({
    confirmPhrase: params.confirmPhrase.trim(),
    reason: params.reason || undefined,
  })
  return res.data
}
