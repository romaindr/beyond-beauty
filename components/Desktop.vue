<template>
  <div class="beyond-beauty" :class="{'overflow': process.browser}">
    <v-loader ref="loader"></v-loader>
    <v-logo ref="logo"></v-logo>
    <v-menu-button  ref="menuButton"></v-menu-button>
    <v-menu ref="siteMenu"></v-menu>
    <v-home-canvas ref="homeCanvas"></v-home-canvas>
    <transition name="pageTrans" mode="out-in" @enter="pageEnter" @leave="pageLeave" @css="false">
      <nuxt ref="page" :key="route.params.pageId || route.name"/>
    </transition>
    <v-sound ref="sound"></v-sound>
    <v-mouse ref="mouse"></v-mouse>
  </div>
</template>

<script>
import Emitter from '~/assets/js/events'
import NoisePosition from '~/assets/js/blobs/NoisePosition.js'
import Stats from 'stats-js'
import { TweenMax } from 'gsap'
import vHomeCanvas from '~/components/HomeCanvas.vue'
import vLogo from '~/components/common/Logo.vue'
import vMenuButton from '~/components/common/MenuButton.vue'
import vLoader from '~/components/common/Loader.vue'
import vMenu from '~/components/menu/Menu.vue'
import vMouse from '~/components/common/Mouse.vue'
import vSound from '~/components/common/Sound.vue'
import ResizeHelper from '~/assets/js/utils/ResizeHelper'
import SoundHelper from '~/assets/js/utils/SoundHelper'
import MouseHelper from '~/assets/js/utils/MouseHelper'

import { mapActions, mapState, mapGetters } from 'vuex'
if(process.browser){
  var MMUnpacker = require('mm-unpacker')
  require('intersection-observer')
  require('gsap/Draggable')
  require('gsap/ThrowPropsPlugin')
}
const load = require('load-asset');


export default {
  data(){
    return {
      process
    }
  },
  computed:{
    ...mapState(['isAppReady', 'isPageTransition', 'isMenuOpen', 'route', 'currentHomeSlideId', 'isCanvasVisible']),
    ...mapGetters(['getPageIdNum', 'isTablet'])
  },
  components:{vHomeCanvas, vMenu, vLogo, vMenuButton, vLoader, vMouse, vSound},
  methods:{
    ...mapActions(['setPacker', 'setMenuOpen', 'setAppLoaded','setPageTransition']),
    async load() {

      const path = process.env.NODE_ENV === 'development' ? '/' : 'https://assets.beyond-beauty.co/'
      try {
        const assets =  await load.all([{ url: `${path}images/pack/pack.json`, type: 'json'},{ url: `${path}images/pack/pack.pack`, type: 'blob'}])
        if(process.browser){
          const unpacker = new MMUnpacker(assets[1], assets[0]);
          this.setPacker(unpacker)
          this.$nextTick(this.onLoaded.bind(this))
        }
      } catch (e) {
        console.error('Request boom! ', e)
      }

    },
    checkButton(from, to){
      if(!from) {
        if(to.name === 'index') {
          this.$refs.logo.show()
        } else {
          this.$refs.menuButton.show()
        }
      }else{
        if(to.name !== from.name){
          if(from.name === 'index') {
            this.$refs.logo.hide()
            setTimeout(() => {this.$refs.menuButton.show()}, 1000)
          }
          if(to.name === 'index') {
            this.$refs.menuButton.hide()
            setTimeout(() => {this.$refs.logo.show()}, 1000)
          }
        }
      }
    },
    pageEnter(el, done) {
      TweenMax.set(this.$refs.page.$children[0].$el, {yPercent: 0})
      if(this.isPageTransition) this.$refs.homeCanvas.showPage(0,0,'none')
      this.setPageTransition(false)
      done()
      if(this.$refs.page)this.$refs.page.$children[0].onReady && this.$refs.page.$children[0].onReady(false)
      this.$refs.homeCanvas.isTickAvailable = true
      setTimeout(() => {
        this.resize(true)
      }, 100)
    },
    pageLeave(el, done) {
      if(this.isPageTransition){
        this.$refs.page.$children[0].hidePush()
        TweenMax.to(this.$refs.page.$children[0].$el, 1.3,{yPercent: -50, ease: Power4.easeInOut})
        this.$refs.homeCanvas.pageTransition()
        setTimeout(() => {
          done()
        }, 1000)
      }else{
        done()
      }
    },
    resize(forceAfterRoute = false){
      const w = ResizeHelper.width()
      const h = ResizeHelper.height()
      if(this.isAppReady) {
        if(this.$refs.page)this.$refs.page.$children[0].resize && this.$refs.page.$children[0].resize(w, h)
        if(!forceAfterRoute)this.$refs.homeCanvas.resize(w, h)
        if(!forceAfterRoute)this.$refs.siteMenu.resize(w, h)
        this.$refs.sound.resize(w, h)
      }
      this.$refs.mouse.resize(w,h)
    },
    setDebug() {
      this.stats = new Stats();
      document.body.appendChild( this.stats.domElement );
      this.stats.domElement.style.position = 'fixed';
      this.stats.domElement.style.right = '0px';
      this.stats.domElement.style.top = '0px';
      this.stats.domElement.style.zIndex = 100;
    },
    tick(){
      if(!this.isAppReady) {
        this.$refs.loader.tick()
      }else{
        this.$refs.homeCanvas.tick()
        this.$refs.logo.tick()
        this.$refs.siteMenu.tick()
        this.$refs.menuButton.tick()
        if(this.$refs.page)this.$refs.page.$children[0].tick()
        if(this.route.name === "story-pageId")this.$refs.sound.tick()
      }
      NoisePosition.tick()
      MouseHelper.tick()
      this.$refs.mouse.tick()
    },
    onLoaded(){
      if(!this.$refs.page)return
      this.setAppLoaded()
      SoundHelper.load()
      Emitter.on('GLOBAL:RESIZE', this._resize)
      this.page = this.$refs.page.$children[0]
      this.$refs.homeCanvas.load()
      if(this.page)this.$refs.page.$children[0].load && this.$refs.page.$children[0].load()

    },
    onReady() {
      this.resize()
      if(this.page)this.$refs.page.$children[0].onReady && this.$refs.page.$children[0].onReady(true)
      this.checkButton(null, this.$route)
      if(process.browser){
        this.$refs.homeCanvas.onReady()
        this.$refs.siteMenu.onReady()
        SoundHelper.onReady()
      }
    }
  },
  beforeDestroy(){
    clearTimeout(this.loadAndTickerTimeout)
    if(process.browser){
      Emitter.removeListener('GLOBAL:RESIZE', this._resize)
      TweenMax.ticker.removeEventListener('tick', this._tick)
    }
  },
  created(){
    this.date = new Date()
  },
  watch: {
    isAppReady() {
      this.onReady()
    }
  },
  created() {
  },
  mounted () {
    if(process.browser) {
      window.resolution = this.isTablet ? .5 : 1
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if(gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        if(renderer == "Intel Iris Graphics") window.resolution = .5
      }
      if(window.devicePixelRatio < 1.5)window.resolution = .5
    }
    this._resize = this.resize.bind(this)
    this._tick = this.tick.bind(this)
    this.$router.beforeEach((to, from, next) => {
      SoundHelper.fadeOut()
      this.checkButton(from, to)
      let doNext = true
      if(!this.isPageTransition){
        this.$refs.homeCanvas.checkSwitchBeforePageChange()
        setTimeout(next, 1)
        doNext = false
      }
      if(from.name === 'index' && to.name === 'story-pageId' && this.isMenuOpen) {
        if(this.getPageIdNum(to.params.pageId) === this.currentHomeSlideId){
          setTimeout(next, 800)
          doNext = false
        }
      }
      if(from.name === 'story-pageId' && to.name === 'index' && this.isMenuOpen && this.isCanvasVisible) {
          setTimeout(next, 800)
          doNext = false
      }
      if(from.name === 'about' && to.name === 'index' && this.currentHomeSlideId !== -1) {
          let delay = 1
          if(this.isMenuOpen && this.isCanvasVisible){
            delay = 800
          }
          setTimeout(()=>{
            this.$refs.homeCanvas.showHomeSlide()
          }, delay)

      }
      this.$nextTick(()=>{this.setMenuOpen(false)})
      Emitter.emit('HIDE_MOUSE');
      if(doNext)next()
    })
     window.addEventListener("blur", () => {
      SoundHelper.setBlur()
    }, false);
     window.addEventListener("focus", () => {
      SoundHelper.setFocus()
    }, false);

    this.loadAndTickerTimeout = setTimeout(()=>{
        TweenMax.ticker.addEventListener('tick', this._tick)
        this.load()
      }, 100)
    this.resize()
  }
}
</script>

<style lang="stylus">
@import './../assets/stylus/base/font.styl'
.beyond-beauty
  height 100%
  position relative
  width 100%
  &.overflow
    overflow hidden


</style>
