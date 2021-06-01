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
  }

  render(funcDef) {
    let func = new Function('x', 'y', 'x2', 'y2', 'w', 'u', 'v', funcDef)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < canvas.height; y += 1) {    
      for (let x = 0; x < canvas.width; x += 1) {
        // let r = Math.floor(256 * Math.random()),
        //     g = Math.floor(256 * Math.random()),
        //     b = Math.floor(256 * Math.random()),
        //     a = 1;

        // ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`

        let x2 = x - originX,
            y2 = y - originY,
            w = Math.sqrt(x2 ** 2 + y2 ** 2),
            u = x2 / w,
            v = y2 / w;

        let [tx, ty] = func(x, y, x2, y2, w, u, v)

        // let ang = Math.floor(360 * Math.random())
        let ang = 180 * Math.atan2(ty, tx) / Math.PI

        ctx.fillStyle = `hsl(${ang}, 100%, 50%)`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  round(num, places) {
    let prec = 10**places
    return Math.floor(num * prec) / prec;
  }
}

//

options = {}
renderer = new Renderer(options)

$$('#renderButton').addEventListener('click', event => {
  let funcDef = $$('#functionDef').value;
  console.log(funcDef)
  renderer.render(funcDef)
})

$$('#renderButton').dispatchEvent(new Event('click'))
