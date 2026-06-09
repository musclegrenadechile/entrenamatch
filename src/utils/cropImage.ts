/** Zoom mínimo para que la imagen cubra el área de recorte. */
export function minCoverZoom(
  imgW: number,
  imgH: number,
  cropW: number,
  cropH: number
): number {
  if (imgW <= 0 || imgH <= 0 || cropW <= 0 || cropH <= 0) return 1
  return Math.max(cropW / imgW, cropH / imgH)
}

export function clampCropOffset(
  offsetX: number,
  offsetY: number,
  displayW: number,
  displayH: number,
  cropW: number,
  cropH: number
): { x: number; y: number } {
  const maxX = Math.max(0, (displayW - cropW) / 2)
  const maxY = Math.max(0, (displayH - cropH) / 2)
  return {
    x: Math.min(maxX, Math.max(-maxX, offsetX)),
    y: Math.min(maxY, Math.max(-maxY, offsetY)),
  }
}

export type CropTransform = {
  naturalW: number
  naturalH: number
  cropW: number
  cropH: number
  zoom: number
  offsetX: number
  offsetY: number
}

/** Genera JPEG data URL recortado según transformación en pantalla. */
export function cropImageToDataUrl(
  image: HTMLImageElement,
  transform: CropTransform,
  outputSize = 1080,
  quality = 0.88
): string {
  const { naturalW, naturalH, cropW, cropH, zoom, offsetX, offsetY } = transform
  const baseZoom = minCoverZoom(naturalW, naturalH, cropW, cropH)
  const scale = baseZoom * zoom
  const displayW = naturalW * scale
  const displayH = naturalH * scale

  const imgLeft = cropW / 2 - displayW / 2 + offsetX
  const imgTop = cropH / 2 - displayH / 2 + offsetY

  const srcX = Math.max(0, (-imgLeft / displayW) * naturalW)
  const srcY = Math.max(0, (-imgTop / displayH) * naturalH)
  const srcW = Math.min(naturalW - srcX, (cropW / displayW) * naturalW)
  const srcH = Math.min(naturalH - srcY, (cropH / displayH) * naturalH)

  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = Math.round(outputSize * (cropH / cropW))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')
  ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}
