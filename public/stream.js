let isPresenting = false
let presentingId

/**
 * @type {null | WHEPClient}
 */
let whepClient = null
/**
 * Set the stream options in a script tag of htmx response, then the video client will pick it up
 * @type {{streamUrl: string, streamId: string, isPresenting: boolean, playbackUrl: string, isWatching: boolean}}
 */
const streamOptions = {
  playbackUrl: '',
  streamUrl: '',
  streamId: '',
  isWatching: false,
  isPresenting: false,
}

window.addEventListener('locationchange', function () {
  console.log('location changed!')
  initiateWHEPClient()
})

const checkIsPresentingUrl = () => {
  const location = window.location.pathname
  presentingId = window.location.pathname.split('/').pop()
  if (location.startsWith('/present')) {
    isPresenting = true
    return true
  }
}
const checkIsViewingUrl = () => {
  if (window.location.pathname.startsWith('/q/')) {
    return true
  }
}

/**
 * Example implementation of a client that uses WHIP to broadcast video over WebRTC
 *
 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html
 */
class WHIPClient {
  constructor(endpoint, videoElement) {
    this.endpoint = endpoint
    this.videoElement = videoElement
    /**
     * Create a new WebRTC connection, using public STUN servers with ICE,
     * allowing the client to disover its own IP address.
     * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#ice
     */
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.cloudflare.com:3478',
        },
      ],
      bundlePolicy: 'max-bundle',
    })
    /**
     * Listen for negotiationneeded events, and use WHIP as the signaling protocol to establish a connection
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
     * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html
     */
    this.peerConnection.addEventListener('negotiationneeded', async ev => {
      console.log('Connection negotiation starting')
      await negotiateConnectionWithClientOffer(
        this.peerConnection,
        this.endpoint,
      )
      console.log('Connection negotiation ended')
    })
    /**
     * While the connection is being initialized,
     * connect the video stream to the provided <video> element.
     */
    this.accessLocalMediaSources()
      .then(stream => {
        this.localStream = stream
        videoElement.srcObject = stream
      })
      .catch(console.error)
  }
  /**
   * Ask for camera and microphone permissions and
   * add video and audio tracks to the peerConnection.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
   */
  async accessLocalMediaSources() {
    return navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => {
          const transceiver = this.peerConnection.addTransceiver(track, {
            /** WHIP is only for sending streaming media */
            direction: 'sendonly',
          })
          if (track.kind === 'video' && transceiver.sender.track) {
            transceiver.sender.track.applyConstraints({
              width: 1280,
              height: 720,
            })
          }
        })
        return stream
      })
  }
  /**
   * Terminate the streaming session
   * 1. Notify the WHIP server by sending a DELETE request
   * 2. Close the WebRTC connection
   * 3. Stop using the local camera and microphone
   *
   * Note that once you call this method, this instance of this WHIPClient cannot be reused.
   */
  async disconnectStream() {
    var _a
    const response = await fetch(this.endpoint, {
      method: 'DELETE',
      mode: 'cors',
    })
    this.peerConnection.close()
    ;(_a = this.localStream) === null || _a === void 0
      ? void 0
      : _a.getTracks().forEach(track => track.stop())
  }
}

class WHEPClient {
  constructor(endpoint, videoElement) {
    document
      .querySelector('#video-loading-indicator')
      .classList.remove('hidden')
    // hide video element until connected
    document.querySelector('#video').classList.add('hidden')
    this.endpoint = endpoint
    this.videoElement = videoElement
    this.stream = new MediaStream()
    /**
     * Create a new WebRTC connection, using public STUN servers with ICE,
     * allowing the client to disover its own IP address.
     * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#ice
     */
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.cloudflare.com:3478',
        },
      ],
      bundlePolicy: 'max-bundle',
    })
    /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTransceiver */
    this.peerConnection.addTransceiver('video', {
      direction: 'recvonly',
    })
    this.peerConnection.addTransceiver('audio', {
      direction: 'recvonly',
    })

    /**
     * When new tracks are received in the connection, store local references,
     * so that they can be added to a MediaStream, and to the <video> element.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
     */
    this.peerConnection.ontrack = event => {
      const track = event.track
      const currentTracks = this.stream.getTracks()
      const streamAlreadyHasVideoTrack = currentTracks.some(
        track => track.kind === 'video',
      )
      const streamAlreadyHasAudioTrack = currentTracks.some(
        track => track.kind === 'audio',
      )
      switch (track.kind) {
        case 'video':
          if (streamAlreadyHasVideoTrack) {
            break
          }
          this.stream.addTrack(track)
          break
        case 'audio':
          if (streamAlreadyHasAudioTrack) {
            break
          }
          this.stream.addTrack(track)
          break
        default:
          console.log('got unknown track ' + track)
      }
    }
    this.peerConnection.addEventListener('connectionstatechange', ev => {
      if (this.peerConnection.connectionState !== 'connected') {
        return
      }
      if (!this.videoElement.srcObject) {
        this.videoElement.srcObject = this.stream
      }
    })
    this.peerConnection.addEventListener('negotiationneeded', ev => {
      negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint)
    })

    /**
     *
     * @param ev {Event<RTCPeerConnectionIceEvent>}
     */
    this.peerConnection.oniceconnectionstatechange = ev => {
      console.log(ev.target.iceConnectionState)
      if (ev.target.iceConnectionState === 'connected') {
        console.log('ice connection successful')
        document.querySelector('#video').classList.remove('hidden')
        document
          .querySelector('#video-loading-indicator')
          .classList.add('hidden')
      }
      if (ev.target.iceConnectionState === 'checking') {
        console.log('ice connection checking')
        document
          .querySelector('#video-loading-indicator')
          .classList.remove('hidden')
      }
      if (ev.target.iceConnectionState === 'failed') {
        console.log('ice connection failed')
        document.querySelector('#video').classList.add('hidden')
        document
          .querySelector('#video-loading-indicator')
          .classList.add('hidden')
      }
    }
  }
  disconnectStream() {
    this.peerConnection.close()
    this.videoElement.srcObject = null
    this.stream.getTracks().forEach(track => track.stop())
    streamOptions.isWatching = false
  }
  reconnectStream() {
    this.peerConnection.createOffer().then(offer => {
      this.peerConnection.setLocalDescription(offer)
      negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint)
    })
  }
}

/**
 * Performs the actual SDP exchange.
 *
 * 1. Constructs the client's SDP offer
 * 2. Sends the SDP offer to the server,
 * 3. Awaits the server's offer.
 *
 * SDP describes what kind of media we can send and how the server and client communicate.
 *
 * https://developer.mozilla.org/en-US/docs/Glossary/SDP
 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html#name-protocol-operation
 */
async function negotiateConnectionWithClientOffer(peerConnection, endpoint) {
  /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer */
  const offer = await peerConnection.createOffer()
  /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription */
  await peerConnection.setLocalDescription(offer)
  /** Wait for ICE gathering to complete */
  let ofr = await waitToCompleteICEGathering(peerConnection)
  if (!ofr) {
    throw Error('failed to gather ICE candidates for offer')
  }
  /**
   * As long as the connection is open, attempt to...
   */
  while (peerConnection.connectionState !== 'closed') {
    /**
     * This response contains the server's SDP offer.
     * This specifies how the client should communicate,
     * and what kind of media client and server have negotiated to exchange.
     */
    let response = await postSDPOffer(endpoint, ofr.sdp)
    if (response.status === 201) {
      let answerSDP = await response.text()
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: answerSDP }),
      )
      return response.headers.get('Location')
    } else if (response.status === 405) {
      console.error('Update the URL passed into the WHIP or WHEP client')
    } else {
      const errorMessage = await response.text()
      console.error(errorMessage)
    }
    /** Limit reconnection attempts to at-most once every 5 seconds */
    await new Promise(r => setTimeout(r, 5000))
  }
}
async function postSDPOffer(endpoint, data) {
  return await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/sdp',
    },
    body: data,
  })
}
/**
 * Receives an RTCPeerConnection and waits until
 * the connection is initialized or a timeout passes.
 *
 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html#section-4.1
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceGatheringState
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icegatheringstatechange_event
 */
async function waitToCompleteICEGathering(peerConnection) {
  return new Promise(resolve => {
    /** Wait at most 1 second for ICE gathering. */
    setTimeout(function () {
      resolve(peerConnection.localDescription)
    }, 1000)
    peerConnection.onicegatheringstatechange = ev =>
      peerConnection.iceGatheringState === 'complete' &&
      resolve(peerConnection.localDescription)
  })
}

//iife
async function initiateWHEPClient() {
  if (checkIsViewingUrl() && !streamOptions.isWatching) {
    console.log('viewing url')
    await waitForPlaybackUrl()
    const videoElement = document.getElementById('output-video')
    const url = streamOptions.playbackUrl
    whepClient = new WHEPClient(url, videoElement)
    streamOptions.isWatching = true
  }
}

async function waitForPlaybackUrl() {
  document.querySelector('#video').classList.add('hidden')
  return new Promise(resolve => {
    setTimeout(function () {
      console.log('waiting for playback url')
      if (streamOptions.playbackUrl && streamOptions.playbackUrl !== '') {
        console.log('got playback url')
        resolve(streamOptions.playbackUrl)
      }
    }, 1000)
  })
}
async function waitForStreamUrl() {
  return new Promise(resolve => {
    setTimeout(function () {
      console.log('waiting for stream url')
      if (streamOptions.streamUrl && streamOptions.streamUrl !== '') {
        console.log('got stream url')
        resolve(streamOptions.streamUrl)
      }
    }, 1000)
  })
}

async function stopStream(url) {}
async function stopWatching(url) {
  whepClient.disconnectStream()
  whepClient = null
  streamOptions.isWatching = false
}

async function watchStream(url) {}

const observeUrlChange = () => {
  let oldHref = document.location.href
  const body = document.querySelector('body')
  const observer = new MutationObserver(mutations => {
    if (oldHref !== document.location.href) {
      oldHref = document.location.href
      /* Changed ! your code here */
      initiateWHEPClient()
      if (!checkIsPresentingUrl()) {
        if (streamOptions.isPresenting) {
          stopStream()
        }
      }
      if (!checkIsViewingUrl()) {
        if (streamOptions.isWatching) {
          stopWatching()
        }
      }
    }
  })
  observer.observe(body, { childList: true, subtree: true })
}
/**
 * @type {null | WHIPClient}
 */
let whipClient = null
const startStream = async () => {
  const videoElement = document.querySelector('#input-video')
  console.log(videoElement)
  whipClient = new WHIPClient(await waitForStreamUrl(), videoElement)
  streamOptions.isPresenting = true
}
const stopStreaming = async () => {
  if (!whipClient) return
  await whipClient.disconnectStream()
  whipClient = null
}

/**
 * * @param e {Event<HTMLInputElement>}
 * @returns {Promise<void>}
 */
const toggleStream = async e => {
  console.log(e.target.checked, 'checked')
  if (e.target.checked) {
    await startStream()
    document.querySelector('#video-preview-toggle').classList.remove('hidden')
    document.querySelector('#stream-container').classList.remove('hidden')
    document.querySelector('#video-preview-toggle input').checked = true
  } else {
    await stopStreaming()
    document.querySelector('#video-preview-toggle').classList.add('hidden')
    document.querySelector('#video-preview-toggle input').checked = false
    document.querySelector('#stream-container').classList.add('hidden')
  }
}

/**
 * * @param e {Event<HTMLInputElement>}
 * @returns {Promise<void>}
 */
const toggleVideoPreview = e => {
  const videoPreview = document.querySelector('#stream-container')
  if (e.target.checked) {
    videoPreview.classList.remove('hidden')
  } else {
    videoPreview.classList.add('hidden')
  }
}

/**
 * param e {Event<HTMLInputElement>}
 */
const toggleWatchStream = e => {
  if (e.target.checked) {
    console.log('start watching')
    initiateWHEPClient()
    document.querySelector('#video').classList.remove('hidden')
  } else {
    console.log('stop watching')
    streamOptions.isWatching = false
    stopWatching()
    document.querySelector('#video').classList.add('hidden')
  }
}

const reloadStream = () => {
  console.log('reloading stream')
  if (whepClient) {
    whepClient.disconnectStream()
    whepClient = null
  }
  initiateWHEPClient()
}

document.addEventListener('DOMContentLoaded', event => {
  console.log('loaded')

  observeUrlChange()
  initiateWHEPClient()
})
