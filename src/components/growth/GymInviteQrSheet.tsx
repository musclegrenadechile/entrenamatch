import { useEffect, useState } from 'react'
import type { Firestore } from 'firebase/firestore'
import { recordPilotDensityEvent } from '../../services/pilotDensityMetrics'
import { Copy, QrCode, Share2, X } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND_COPY } from '../../constants/brandCopy'

export interface GymInviteQrSheetProps {
  open: boolean
  inviteUrl: string
  gymName?: string
  onClose: () => void
  db?: Firestore | null
  city?: string | null
  isDemoMode?: boolean
}

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/'

export function GymInviteQrSheet({
  open,
  inviteUrl,
  gymName,
  onClose,
  db = null,
  city = null,
  isDemoMode = false,
}: GymInviteQrSheetProps) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    if (!open) return
    void recordPilotDensityEvent(db, {
      city: city || gymName,
      kind: 'gym_qr_open',
      isDemoMode,
    })
  }, [open, db, city, gymName, isDemoMode])

  if (!open) return null

  const qrSrc = `${QR_API}?size=280x280&data=${encodeURIComponent(inviteUrl)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast.success(BRAND_COPY.explore.inviteToastCopied)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'EntrenaMatch',
          text: gymName
            ? `Únete a EntrenaMatch desde ${gymName}`
            : BRAND_COPY.explore.inviteShareText,
          url: inviteUrl,
        })
        return
      }
      await copyLink()
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label={BRAND_COPY.gymInvite.title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-[#141418] border border-[#2F2F35] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold flex items-center gap-1.5">
              <QrCode size={14} aria-hidden />
              {BRAND_COPY.gymInvite.title}
            </p>
            <h3 className="text-lg font-black text-white mt-1">
              {gymName ? gymName : 'Tu Comunidad'}
            </h3>
            <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
              {BRAND_COPY.gymInvite.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1C1C20] border border-[#2F2F35] flex items-center justify-center text-[#9CA3AF]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          {!imgFailed ? (
            <img
              src={qrSrc}
              alt={BRAND_COPY.gymInvite.qrAlt}
              width={240}
              height={240}
              className="rounded-2xl bg-white p-3"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-[240px] h-[240px] rounded-2xl bg-[#0D0D10] border border-[#2F2F35] flex items-center justify-center text-center p-4">
              <p className="text-[11px] text-[#9CA3AF]">
                QR no disponible — usa copiar o compartir el enlace
              </p>
            </div>
          )}
        </div>

        <p className="text-[10px] text-[#6B7280] break-all text-center mb-4 px-1">{inviteUrl}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex-1 py-3 rounded-xl border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Copy size={14} />
            {BRAND_COPY.gymInvite.copyLink}
          </button>
          <button
            type="button"
            onClick={() => void shareLink()}
            className="flex-1 py-3 rounded-xl bg-[#22c55e] text-black text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 size={14} />
            {BRAND_COPY.gymInvite.share}
          </button>
        </div>
      </div>
    </div>
  )
}
