export interface LiveInputResponse {
  errors: any[]
  messages: any[]
  result: {
    created: string
    deleteRecordingAfterDays: number
    meta: {
      name: string
    }
    modified: string
    recording: {
      mode: string
      requireSignedURLs: boolean
      timeoutSeconds: number
    }
    rtmps: {
      streamKey: string
      url: string
    }
    rtmpsPlayback: {
      streamKey: string
      url: string
    }
    srt: {
      passphrase: string
      streamId: string
      url: string
    }
    srtPlayback: {
      passphrase: string
      streamId: string
      url: string
    }
    status: null
    uid: string
    webRTC: {
      url: string
    }
    webRTCPlayback: {
      url: string
    }
  }
  success: boolean
}

type Stream = {
  enabled: boolean
  streamKey: string
  uid: string
  url: string
}

export type ListOutputResponse = {
  errors: any[]
  messages: any[]
  result: Stream[]
  success: boolean
}
