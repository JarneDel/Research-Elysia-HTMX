function dragElement(ele) {
  if (typeof ele === 'string') {
    ele = { id: ele }
  }

  let element = document.getElementById(ele.id)
  watchResize(element)

  console.log(element, ele)
  console.log('dragElement')
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0

  element.ontouchstart = dragtouch

  if (document.querySelector('#' + ele.id + '-header')) {
    // if present, the header is where you move the DIV from:
    document.querySelector('#' + ele.id + '-header').onmousedown = dragMouseDown
  } else {
    element.onmousedown = dragMouseDown
  }

  /**
   *
   * @param ev {event<ontouchstart>}
   */
  function dragtouch(ev) {
    ev.preventDefault()
    const touch = ev.touches[0]
    pos3 = touch.clientX
    pos4 = touch.clientY
    document.ontouchend = closeDragElement
    document.ontouchmove = elementDrag
  }

  function dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    let clientX, clientY
    if (e.type === 'touchmove') {
      const touch = e.touches[0]
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    pos1 = pos3 - clientX
    pos2 = pos4 - clientY
    pos3 = clientX
    pos4 = clientY

    console.log({ pos3, pos4, touches: e.touches[0], pos1, pos2 })

    const elementWidth = element.offsetWidth
    const elementHeight = element.offsetHeight

    // check if element is out of screen
    if (element.offsetTop - pos2 < 0) {
      element.style.top = '0px'
    } else if (element.offsetTop - pos2 + elementHeight > window.innerHeight) {
      element.style.top = window.innerHeight - elementHeight + 'px'
    } else {
      element.style.top = element.offsetTop - pos2 + 'px'
    }

    if (element.offsetLeft - pos1 < 0) {
      element.style.left = '0px'
    } else if (element.offsetLeft - pos1 + elementWidth > window.innerWidth) {
      element.style.left = window.innerWidth - elementWidth + 'px'
    } else {
      element.style.left = element.offsetLeft - pos1 + 'px'
    }
  }
  function closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
  }
}

let resizeLock = false
/**
 * @type {null | ResizeObserver}
 */
let resizeObserver = null

/**
 * @param entries {ResizeObserverEntry[]}
 */

let isResizing = false

function outputSize(entries) {
  if (isResizing) return

  for (let entry of entries) {
    const { width, height } = entry.contentRect
    // maintain a 16:9 aspect ratio
    const aspectRatio = 16 / 9
    const newWidth = height * aspectRatio - 32
    const element = entry.target

    isResizing = true

    // Use requestAnimationFrame to update element size
    requestAnimationFrame(() => {
      element.style.width = `${newWidth}px`
      element.style.height = `${height}px`

      // Set isResizing back to false after the size change has been made
      requestAnimationFrame(() => {
        isResizing = false
      })
    })

    console.log(`Element size: ${width}px x ${height}px`)
  }
}
function watchResize(element) {
  if (resizeLock) {
    console.log('resizeLock')
    return
  }
  resizeLock = true
  resizeObserver = new ResizeObserver(outputSize)
  resizeObserver.observe(element)
}
