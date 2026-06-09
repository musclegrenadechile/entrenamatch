import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Move, X, ZoomIn } from 'lucide-react'
import { clampCropOffset, cropImageToDataUrl, minCoverZoom } from '../../utils/cropImage'

export type PhotoCropModalProps = {
  open: boolean
  imageSrc: string
  title?: string
  subtitle?: string
  aspectRatio?: number
  onConfirm: (croppedDataUrl: string) => void | Promise<void>
  onCancel: () => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 3

export function PhotoCropModal({
  open,
  imageSrc,
  title = 'Encuadra tu foto',
  subtitle = 'Arrastra y haz zoom para cuadrar cómo te verán en el perfil.',
  aspectRatio = 1,
  onConfirm,
  onCancel,
}: PhotoCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [cropSize, setCropSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    const img = new Image()
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageSrc
  }, [open, imageSrc])

  const measureCrop = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const maxW = rect.width - 32
    const maxH = rect.height - 32
    let w = maxW
    let h = w / aspectRatio
    if (h > maxH) {
      h = maxH
      w = h * aspectRatio
    }
    setCropSize({ w: Math.floor(w), h: Math.floor(h) })
  }, [aspectRatio])

  useEffect(() => {
    if (!open) return
    measureCrop()
    const ro = new ResizeObserver(measureCrop)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [open, measureCrop])

  const applyClampedOffset = useCallback(
    (x: number, y: number, nextZoom = zoom) => {
      if (!naturalSize.w || !cropSize.w) return
      const base = minCoverZoom(naturalSize.w, naturalSize.h, cropSize.w, cropSize.h)
      const displayW = naturalSize.w * base * nextZoom
      const displayH = naturalSize.h * base * nextZoom
      setOffset(clampCropOffset(x, y, displayW, displayH, cropSize.w, cropSize.h))
    },
    [naturalSize, cropSize, zoom]
  )

  useEffect(() => {
    applyClampedOffset(offset.x, offset.y, zoom)
  }, [zoom, cropSize.w, naturalSize.w])

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    applyClampedOffset(dragRef.current.ox + dx, dragRef.current.oy + dy)
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  const handleConfirm = async () => {
    if (!naturalSize.w || !cropSize.w || saving) return
    setSaving(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
        img.src = imageSrc
      })
      const cropped = cropImageToDataUrl(img, {
        naturalW: naturalSize.w,
        naturalH: naturalSize.h,
        cropW: cropSize.w,
        cropH: cropSize.h,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      })
      await onConfirm(cropped)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const baseZoom =
    naturalSize.w && cropSize.w
      ? minCoverZoom(naturalSize.w, naturalSize.h, cropSize.w, cropSize.h)
      : 1
  const displayW = naturalSize.w * baseZoom * zoom
  const displayH = naturalSize.h * baseZoom * zoom

  return (
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      role="dialog"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F2F35]">
        <button
          type="button"
          onClick={onCancel}
          className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center text-white"
          aria-label="Cancelar"
        >
          <X size={18} />
        </button>
        <div className="text-center min-w-0 px-2">
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="text-[10px] text-[#9CA3AF] truncate">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving || !naturalSize.w}
          className="w-9 h-9 rounded-full bg-[#FF671F] flex items-center justify-center text-black disabled:opacity-40"
          aria-label="Guardar recorte"
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden touch-none">
        {cropSize.w > 0 && naturalSize.w > 0 && (
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden"
            style={{
              width: cropSize.w,
              height: cropSize.h,
              marginLeft: -cropSize.w / 2,
              marginTop: -cropSize.h / 2,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute max-w-none select-none pointer-events-none"
              style={{
                width: displayW,
                height: displayH,
                left: cropSize.w / 2 - displayW / 2 + offset.x,
                top: cropSize.h / 2 - displayH / 2 + offset.y,
              }}
            />
            <div className="absolute inset-0 border-2 border-white/90 rounded-sm pointer-events-none" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/40" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-[#2F2F35] space-y-3 bg-[#0D0D10]">
        <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
          <Move size={14} className="text-[#FF671F] shrink-0" />
          <span>Desliza para mover · pellizca o usa el zoom</span>
        </div>
        <div className="flex items-center gap-3">
          <ZoomIn size={16} className="text-[#FF671F] shrink-0" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#FF671F]"
            aria-label="Zoom"
          />
          <span className="text-[10px] text-[#9CA3AF] w-8 text-right">{Math.round(zoom * 100)}%</span>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving || !naturalSize.w}
          className="w-full py-3 rounded-2xl bg-[#FF671F] text-black font-bold text-sm disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Usar este encuadre'}
        </button>
      </div>
    </div>
  )
}
