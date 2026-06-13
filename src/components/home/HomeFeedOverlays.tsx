import type { ChangeEvent, RefObject } from 'react'
import { FeedComposerModal } from '../feed/FeedComposerModal'

export type FeedPhotoLightboxProps = {
  url: string
  onClose: () => void
}

export function FeedPhotoLightbox({ url, onClose }: FeedPhotoLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[96vw] max-h-[96vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt="Foto del Muro"
          className="max-w-full max-h-[90vh] rounded-3xl object-contain shadow-[0_0_80px_rgba(255,103,31,0.15)]"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-[#FF671F] text-black w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black shadow-lg active:scale-95"
        >
          ×
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] bg-black/70 text-white/90 px-4 py-1 rounded-full tracking-widest">
          TOCA FUERA PARA CERRAR • FEED POST
        </div>
      </div>
    </div>
  )
}

export type HomeFeedOverlaysProps = {
  showComposer: boolean
  text: string
  photo: string | null
  photoUploading: boolean
  photoUploadProgress: number
  publishing: boolean
  onCloseComposer: () => void
  onTextChange: (value: string) => void
  onPhotoRemove: () => void
  onPhotoPreview: (url: string) => void
  onPublish: () => void
  onPhotoFile: (e: ChangeEvent<HTMLInputElement>) => void
  onPickNativePhoto: () => void | Promise<void>
  photoInputRef: RefObject<HTMLInputElement | null>
}

/** Fase 357 — feed composer colocated with Home tab. */
export function HomeFeedOverlays({
  showComposer,
  text,
  photo,
  photoUploading,
  photoUploadProgress,
  publishing,
  onCloseComposer,
  onTextChange,
  onPhotoRemove,
  onPhotoPreview,
  onPublish,
  onPhotoFile,
  onPickNativePhoto,
  photoInputRef,
}: HomeFeedOverlaysProps) {
  return (
    <FeedComposerModal
      open={showComposer}
      text={text}
      photo={photo}
      photoUploading={photoUploading}
      photoUploadProgress={photoUploadProgress}
      publishing={publishing}
      onClose={onCloseComposer}
      onTextChange={onTextChange}
      onPhotoRemove={onPhotoRemove}
      onPhotoPreview={onPhotoPreview}
      onPublish={onPublish}
      onPhotoFile={onPhotoFile}
      onPickNativePhoto={onPickNativePhoto}
      photoInputRef={photoInputRef}
    />
  )
}
