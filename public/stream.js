import WHIPClient from '/public/WHIPClient.js'

let isPresenting = false
let presentingId

window.addEventListener('locationchange', function () {
  console.log('location changed!')
  checkIsPresentingUrl()
})

const checkIsPresentingUrl = () => {
  const location = window.location.pathname
  presentingId = window.location.pathname.split('/').pop()
  console.log(location)
  if (location.startsWith('/present')) {
    isPresenting = true
    return true
  }
}

const getWithAuthorization = url => {}

const getWebcamStream = async () => {
  const constraints = {
    audio: true,
    video: true,
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints)
  } catch (err) {
    console.error(err)
  }
}

//iife
;(async () => {
  if (checkIsPresentingUrl()) {
    console.log('correct url')
    const stream = await getWebcamStream()
    console.log(stream)

    const url = '<WEBRTC_URL_FROM_YOUR_LIVE_INPUT>'
    const videoElement = document.getElementById('input-video')

    self.client = new WHIPClient(url, videoElement)
  }
})()
