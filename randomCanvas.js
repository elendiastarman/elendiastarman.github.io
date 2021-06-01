$$ = (selector => document.querySelector(selector))

let canvas = $$('#canvas'),
    ctx = canvas.getContext('2d'),
    originX = canvas.width / 2,
    originY = canvas.height / 2;

let fontSize = 14;
ctx.font = `${fontSize}px sans-serif`

//

class Renderer {
  constructor(options) {
    this.frameStart = new Date()
    this.oldFrameStart = this.frameStart
    this.halt = true
    this.data = ctx.createImageData(canvas.width, canvas.height).data
    this.imgdata = null
    this.newImage = null
  }

  updateLoop() {
    let result = {};

    // this does interesting stuff calculat-...calculatorally?
    this.imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let toIndex = (x, y) => x + y * canvas.width,
        newData = this.imgdata,
        rando = 0,
        offset = (Math.sqrt(5) - 1) / 2;

    for (let y = 0; y < canvas.height; y += 1) {    
      for (let x = 0; x < canvas.width; x += 1) {
        let index = toIndex(x, y)

        rando += offset
        if (rando > 1)
          rando -= 1

        this.data[index] += rando / 1;
        newData.data[4 * index + 0] = this.data[index];
        newData.data[4 * index + 1] = this.data[index];
        newData.data[4 * index + 2] = this.data[index];
        newData.data[4 * index + 3] = 255;
      }
    }

    //

    this.newImage = newData
    result.image = newData
    return result;
  }

  renderLoop() {
    if (!this.halt)
      window.requestAnimationFrame(this.renderLoop.bind(this))

    this.oldFrameStart = this.frameStart
    this.frameStart = new Date()

    let afterUpdate = null,
        afterRender = null;

    // this does interesting stuff graphically
    let result = this.updateLoop()
    afterUpdate = new Date()

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.putImageData(result.image, 0, 0)
    afterRender = new Date()

    // draws text for fps stuff

    let elapsedUpdate = afterUpdate - this.frameStart,
        elapsedRender = afterRender - afterUpdate,
        elapsedFrame = this.frameStart - this.oldFrameStart;

    ctx.fillStyle = '#FFA'

    let lines = [
      `update time: ${elapsedUpdate}`,
      `render time: ${elapsedRender}`,
      `frame time: ${elapsedFrame}`,
      `useful time: ${elapsedFrame - elapsedRender}`,
      `ratio: ${this.round(elapsedUpdate / (elapsedFrame - elapsedRender), 3)}`,
    ]

    ctx.beginPath()
    lines.forEach((line, index) => {
      ctx.fillText(line, 5, 5 + (index + 1) * fontSize)
    })
  }

  round(num, places) {
    let prec = 10**places
    return Math.floor(num * prec) / prec;
  }

  // boring stuff tbh

  startLoop(event) {
    this.halt = false
    window.requestAnimationFrame(this.renderLoop.bind(this))
  }

  stopLoop(event) {
    this.halt = true
  }
}

//

options = {}
renderer = new Renderer(options)

$$('#start').addEventListener('click', renderer.startLoop.bind(renderer))
$$('#stop').addEventListener('click', renderer.stopLoop.bind(renderer))
