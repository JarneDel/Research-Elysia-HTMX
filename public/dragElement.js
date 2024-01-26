class DragElement {
  constructor(ele) {
    if (typeof ele === 'string') {
      ele = { id: ele }
    }

    this.element = document.getElementById(ele.id)
    this.watchResize(this.element)

    this.pos1 = 0
    this.pos2 = 0
    this.pos3 = 0
    this.pos4 = 0

    this.element.ontouchstart = this.dragtouch.bind(this)

    if (document.querySelector('#' + ele.id + '-header')) {
      document.querySelector('#' + ele.id + '-header').onmousedown =
        this.dragMouseDown.bind(this)
    } else {
      this.element.onmousedown = this.dragMouseDown.bind(this)
    }
  }

  static outputSize(entries) {
    if (DragElement.isResizing) return

    for (let entry of entries) {
      const { width, height } = entry.contentRect
      const aspectRatio = 16 / 9
      const newWidth = height * aspectRatio - 32
      const element = entry.target

      DragElement.isResizing = true

      requestAnimationFrame(() => {
        element.style.width = `${newWidth}px`
        element.style.height = `${height}px`

        requestAnimationFrame(() => {
          DragElement.isResizing = false
        })
      })

      console.log(`Element size: ${width}px x ${height}px`)
    }
  }

  dragtouch(ev) {
    ev.preventDefault()
    const touch = ev.touches[0]
    this.pos3 = touch.clientX
    this.pos4 = touch.clientY
    document.ontouchend = this.closeDragElement.bind(this)
    document.ontouchmove = this.elementDrag.bind(this)
  }

  dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    this.pos3 = e.clientX
    this.pos4 = e.clientY
    document.onmouseup = this.closeDragElement.bind(this)
    document.onmousemove = this.elementDrag.bind(this)
  }

  elementDrag(e) {
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
    this.pos1 = this.pos3 - clientX
    this.pos2 = this.pos4 - clientY
    this.pos3 = clientX
    this.pos4 = clientY

    const elementWidth = this.element.offsetWidth
    const elementHeight = this.element.offsetHeight

    if (this.element.offsetTop - this.pos2 < 0) {
      this.element.style.top = '0px'
    } else if (
      this.element.offsetTop - this.pos2 + elementHeight >
      window.innerHeight
    ) {
      this.element.style.top = window.innerHeight - elementHeight + 'px'
    } else {
      this.element.style.top = this.element.offsetTop - this.pos2 + 'px'
    }

    if (this.element.offsetLeft - this.pos1 < 0) {
      this.element.style.left = '0px'
    } else if (
      this.element.offsetLeft - this.pos1 + elementWidth >
      window.innerWidth
    ) {
      this.element.style.left = window.innerWidth - elementWidth + 'px'
    } else {
      this.element.style.left = this.element.offsetLeft - this.pos1 + 'px'
    }
  }

  closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
  }

  watchResize(element) {
    if (DragElement.resizeLock) {
      console.log('resizeLock')
      return
    }
    DragElement.resizeLock = true
    DragElement.resizeObserver = new ResizeObserver(DragElement.outputSize)
    DragElement.resizeObserver.observe(element)
  }
}

DragElement.resizeLock = false
DragElement.resizeObserver = null
DragElement.isResizing = false

function dragElement(ele) {
  new DragElement(ele)
}
