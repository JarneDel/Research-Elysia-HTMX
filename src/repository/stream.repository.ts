import { supabase } from '@/libs'
import { createStreamCredentials } from '@/libs/streaming.ts'
import { fixOneToOne } from '@/repository/databaseArrayFix.ts'

export class StreamRepository {
  streamId?: string
  private readonly quizCode: string
  playbackUrl?: string
  recordingUrl?: string

  constructor(quizCode: string, streamId?: string) {
    this.streamId = streamId
    this.quizCode = quizCode
  }

  public async createStreamCredentialForActiveQuiz() {
    // check if stream already exists
    const { data: activeQuizData } = await supabase
      .from('active_quiz')
      .select('id, stream (id, stream_id, playback, recording)')
      .eq('id', this.quizCode)
      .single()

    if (activeQuizData) {
      const stream = fixOneToOne(activeQuizData.stream)
      if (stream) {
        this.streamId = stream.stream_id
        this.playbackUrl = stream.playback
        this.recordingUrl = stream.recording
        return {
          streamId: this.streamId,
          playbackUrl: this.playbackUrl,
          recordingUrl: this.recordingUrl,
        }
      }
    }

    const result = await createStreamCredentials()
    this.streamId = result.result.uid
    this.playbackUrl = result.result.webRTCPlayback.url
    this.recordingUrl = result.result.webRTC.url

    await supabase.from('stream').insert([
      {
        stream_id: this.streamId,
        playback: result.result.webRTCPlayback.url,
        recording: result.result.webRTC.url,
      },
    ])
    await supabase
      .from('active_quiz')
      .update({
        stream: this.streamId,
      })
      .eq('id', this.quizCode)

    return {
      streamId: this.streamId,
      playbackUrl: this.playbackUrl,
      recordingUrl: this.recordingUrl,
    }
  }
}
