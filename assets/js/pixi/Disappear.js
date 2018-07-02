
class DisappearMask {
  constructor() {
    this.imgW = 1090 / 5
    this.imgH = 1611 / 5
    this.frameW = 5
    this.currentFrame = -1
    this.currentFrameTween = 0
    this.direction = 'forward'
  }


  setTexture(base) {
    this.mask = new PIXI.Sprite(new PIXI.Texture.from(base))
    this.mask.interactive = false
  }

  disappear() {
    this.currentFrameTween = 0
    this.tweenUpdate()
    TweenMax.to(this, 24, { useFrames: true,  currentFrameTween: 24, ease: Linear.easeInOut, onUpdate: this.tweenUpdate.bind(this) }).timeScale(.5)
  }
  appear() {
    this.currentFrameTween = 24
    this.tweenUpdate()
    TweenMax.to(this, 24, { useFrames: true,  currentFrameTween: 0, ease: Linear.easeInOut, onUpdate: this.tweenUpdate.bind(this) }).timeScale(.5)
  }

  tweenUpdate() {
    if (this.currentFrame === Math.round(this.currentFrameTween)) return
    this.currentFrame = Math.round(this.currentFrameTween)
    const x = this.currentFrame % this.frameW * this.imgW
    const y = Math.floor(this.currentFrame / this.frameW) * this.imgH
    const rect = new PIXI.Rectangle(x, y, this.imgW, this.imgH);
    // console.log(croped);
    this.mask.texture.frame = rect;
    //this.ctx.drawImage(this.img, x, y, this.imgW, this.imgH, 0, 0, this.canvasWidth, this.canvasHeight);
  }


}

export default DisappearMask
