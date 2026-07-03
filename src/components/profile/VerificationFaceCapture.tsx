import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Camera } from 'lucide-react'

type VerificationFaceCaptureProps = {
  value: string | null
  onChange: (dataUrl: string | null) => void
  capacitorCamera?: {
    getPhoto: (opts: Record<string, unknown>) => Promise<{ base64String?: string }>
  } | null
  disabled?: boolean
}

export function VerificationFaceCapture({
  value,
  onChange,
  capacitorCamera,
  disabled,
}: VerificationFaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturingNative, setCapturingNative] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const startWebCamera = useCallback(async () => {
    if (disabled || value) return
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
    } catch {
      setCameraError('No pudimos acceder a la cámara. Revisa permisos del navegador.')
      stopCamera()
    }
  }, [disabled, value, stopCamera])

  useEffect(() => {
    if (value || disabled) {
      stopCamera()
      return
    }
    if (Capacitor.isNativePlatform() && capacitorCamera) return
    void startWebCamera()
    return () => stopCamera()
  }, [value, disabled, capacitorCamera, startWebCamera, stopCamera])

  const captureFromVideo = () => {
    const video = videoRef.current
    if (!video || !cameraReady) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    stopCamera()
    onChange(dataUrl)
  }

  const captureNative = async () => {
    if (!capacitorCamera || capturingNative || disabled) return
    setCapturingNative(true)
    try {
      const photo = await capacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 'base64',
        source: 'CAMERA',
        direction: 'FRONT',
      })
      if (photo?.base64String) {
        onChange(`data:image/jpeg;base64,${photo.base64String}`)
      }
    } catch {
      setCameraError('No se pudo abrir la cámara. Revisa permisos en Ajustes.')
    } finally {
      setCapturingNative(false)
    }
  }

  const retake = () => {
    onChange(null)
    setCameraError(null)
  }

  if (value) {
    return (
      <div className="mb-6">
        <div className="em-v2-verify-capture__preview">
          <img src={value} alt="Selfie de verificación" className="w-full max-h-[360px] object-cover" />
        </div>
        <button
          type="button"
          onClick={retake}
          disabled={disabled}
          className="mt-3 text-sm text-[#FF671F] disabled:opacity-50"
        >
          Tomar otra foto
        </button>
      </div>
    )
  }

  const useNative = Capacitor.isNativePlatform() && !!capacitorCamera

  return (
    <div className="mb-6">
      {useNative ? (
        <button
          type="button"
          onClick={() => void captureNative()}
          disabled={disabled || capturingNative}
          className="em-v2-verify-capture__native disabled:opacity-50"
        >
          <Camera className="mx-auto mb-3 text-[#FF671F]" size={40} />
          <div className="font-medium">{capturingNative ? 'Abriendo cámara…' : 'Tomar selfie con cámara frontal'}</div>
          <div className="text-xs text-[#9CA3AF] mt-1">Centra tu rostro, buena luz, sin filtros</div>
        </button>
      ) : (
        <>
          <div className="em-v2-verify-capture__frame">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#9CA3AF]">
                Iniciando cámara…
              </div>
            )}
            <div className="em-v2-verify-capture__ring" aria-hidden />
          </div>
          <button
            type="button"
            onClick={captureFromVideo}
            disabled={disabled || !cameraReady}
            className="em-v2-hero-card__cta w-full mt-4 disabled:opacity-50"
          >
            Capturar rostro
          </button>
          {cameraError && (
            <p className="text-xs text-red-400 mt-2 text-center">{cameraError}</p>
          )}
        </>
      )}
    </div>
  )
}
