import { useRef, type ChangeEvent, type RefObject } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'

export type FeedComposerModalProps = {
  open: boolean
  text: string
  photo: string | null
  photoUploading: boolean
  photoUploadProgress: number
  publishing: boolean
  onClose: () => void
  onTextChange: (value: string) => void
  onPhotoRemove: () => void
  onPhotoPreview: (url: string) => void
  onPublish: () => void
  onPhotoFile: (e: ChangeEvent<HTMLInputElement>) => void
  /** Native camera + Firebase upload when applicable. */
  onPickNativePhoto: () => void | Promise<void>
  photoInputRef: RefObject<HTMLInputElement | null>
}

/** Fase 352 — Muro publish modal extracted from App.tsx. */
export function FeedComposerModal({
  open,
  text,
  photo,
  photoUploading,
  photoUploadProgress,
  publishing,
  onClose,
  onTextChange,
  onPhotoRemove,
  onPhotoPreview,
  onPublish,
  onPhotoFile,
  onPickNativePhoto,
  photoInputRef,
}: FeedComposerModalProps) {
  const localInputRef = useRef<HTMLInputElement>(null)
  const inputRef = photoInputRef ?? localInputRef

  if (!open) return null

  const handleClose = () => {
    onClose()
  }

  return (
    <div
      className="absolute inset-0 z-[95] bg-black/90 flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={handleClose}
    >
      <div
        className="feed-composer-modal w-full md:w-[520px] rounded-t-3xl md:rounded-3xl p-6 md:p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-3xl">🔥</div>
              <div className="font-black text-2xl tracking-[-1px]">
                Publicar en el {BRAND_COPY.communityWallTitle}
              </div>
            </div>
            <div className="text-sm text-[#9CA3AF] mt-0.5">{BRAND_COPY.feed.publishSubtitle}</div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-3xl text-[#9CA3AF] leading-none mt-[-6px] active:text-white"
          >
            ×
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={
            photo ? 'Añade un caption para tu foto...' : BRAND_COPY.feed.publishPlaceholder
          }
          className="feed-composer-textarea form-input w-full h-32 text-[15px] resize-y mb-4 rounded-2xl p-4"
          maxLength={280}
          autoFocus
        />

        {photo && (
          <div className="text-[10px] text-[#FF671F]/70 -mt-3 mb-3 tracking-wide">
            Foto + texto se publican juntos en el Muro
          </div>
        )}

        {photoUploading && (
          <div className="mb-4">
            <div className="text-xs text-[#9CA3AF] mb-1 flex justify-between">
              <span>{BRAND_COPY.feed.uploadPhoto}</span>
              <span className="text-[#FF671F]">{photoUploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-gradient-to-r from-[#FF671F] via-[#FF4F79] to-[#FF671F] transition-all"
                style={{ width: `${photoUploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {photo && !photoUploading && (
          <div className="mb-4">
            <div className="text-xs text-[#9CA3AF] mb-1.5 flex items-center justify-between px-0.5">
              Foto del entreno{' '}
              <span className="text-[#FF671F]/60">toca para previsualizar</span>
            </div>
            <div
              className="relative inline-block w-full group"
              onClick={() => onPhotoPreview(photo)}
            >
              <img
                src={photo}
                alt="Foto del entreno"
                className="feed-composer-photo w-full max-h-[210px] rounded-2xl object-cover cursor-zoom-in"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPhotoRemove()
                }}
                className="absolute -top-2.5 -right-2.5 bg-black/90 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center border border-white/20 z-10 active:scale-90"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (Capacitor.isNativePlatform()) {
                void onPickNativePhoto()
              } else {
                inputRef.current?.click()
              }
            }}
            className="flex-1 py-3 text-sm border border-[#333] rounded-2xl active:bg-[#25252A] flex items-center justify-center gap-2 hover:border-[#FF671F]/50 transition"
          >
            <Camera size={16} /> {photo ? 'Cambiar foto' : 'Añadir foto del entreno'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={onPublish}
            disabled={!text.trim() || publishing || photoUploading}
            className="flex-1 feed-publish-btn py-3 rounded-2xl text-base disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {publishing ? BRAND_COPY.feed.publishingLabel : BRAND_COPY.feed.publishButton}
          </button>
        </div>

        <div className="text-center text-[10px] text-[#9CA3AF]/70 mt-4">
          Visible para toda la comunidad • reacciones y comentarios en tiempo real • los mejores
          posts se propagan como highlights
        </div>
      </div>
    </div>
  )
}
