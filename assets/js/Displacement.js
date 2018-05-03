import DisplacementPoint from './DisplacementPoint'
import PerlinNoise from '~/assets/js/PerlinNoise'
class Displacement {
  constructor(canvas, numPoints = 16) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d');
    this.color = 'black'
    this.width = 100
    this.height = 100
    this.time = 0
    this.speed = 0.02
    this.scale = 1.8
    this.points = []
  }
  
  init() {
    this.setDisplacement()
    window.gui.add(this, 'speed', 0.001, 1)
    window.gui.add(this, 'scale', 0.01, 10)
  }
  setDisplacement() {
    for(let i = 0; i < this.width * this.height; i++) {
      let point = new DisplacementPoint(i, i % this.width, Math.floor(i / this.width));
      this.points.push(point);
    }
  }

  fill() {
      var i, n, prevPoint, currentPoint, nextPoint, x, y;
      for (i = 0; i < this.width * this.height; i++) {
        currentPoint = this.points[i]
        this.ctx.fillStyle = this.color
        let noise = PerlinNoise.noise((i % this.width) / (10 * this.scale) + this.time, Math.floor(i / this.width) / (10 * this.scale) + this.time, 0.3)
        this.ctx.fillStyle = "rgba(" + Math.floor(noise*255) + "," + Math.floor(noise*255) + "," + Math.floor(noise*255) + "," + 1 + ")";
        this.ctx.fillRect(currentPoint.x, currentPoint.y, 1, 1);
      }

  }

  render() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.save();
    this.fill();
    this.time += this.speed
    this.ctx.restore();
  }
  
}

export default Displacement