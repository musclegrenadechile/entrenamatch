import { describe, expect, it } from 'vitest'
import {
  mapVoiceCaptureError,
  mimeTypeForUpload,
  pickRecorderMimeType,
  workoutVoiceMicErrorMessage,
} from './microphoneAccess'

describe('microphoneAccess', () => {
  it('maps mic error codes to user-facing copy', () => {
    expect(workoutVoiceMicErrorMessage('DENIED')).toContain('Ajustes')
    expect(workoutVoiceMicErrorMessage('NO_DEVICE')).toContain('micrófono')
    expect(workoutVoiceMicErrorMessage('NO_RECORDER')).toContain('Grabación')
    expect(mapVoiceCaptureError(new Error('SHORT'))).toContain('corta')
  })

  it('normalizes recorder mime for upload', () => {
    expect(mimeTypeForUpload('audio/webm;codecs=opus')).toBe('audio/webm')
    expect(mimeTypeForUpload()).toBe('audio/webm')
    expect(mimeTypeForUpload('audio/mp4')).toBe('audio/mp4')
    expect(mimeTypeForUpload('audio/3gpp')).toBe('audio/aac')
  })

  it('pickRecorderMimeType returns undefined when MediaRecorder missing', () => {
    const original = globalThis.MediaRecorder
    // @ts-expect-error test stub
    delete globalThis.MediaRecorder
    expect(pickRecorderMimeType()).toBeUndefined()
    globalThis.MediaRecorder = original
  })
})
