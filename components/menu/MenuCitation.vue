<template>
  <li class="MenuCitation">
   <strong v-text="citation.author" ref="author"></strong>
   <div class="text">
     <p v-for="(text,i) in texts" :key="i" v-text="text" ref="text"></p>
   </div>
  </li>
</template>

<script>
export default {
  name: "menuCitation",

  props:['citation'],
  computed:{
   texts(){
      return this.citation.text.split('<br>')
    },
  },
  methods:{
    show(delay) {
      TweenMax.set(this.$refs.author, {opacity: 0})
      TweenMax.set(this.$refs.text, {opacity: 0, x: 20})
      TweenMax.set(this.$el, {autoAlpha: 1})
      TweenMax.to(this.$refs.author, 1.2,{delay, opacity: 1, ease: Quad.easeOut, force3D: true})
      TweenMax.staggerTo(this.$refs.text, .7,{delay, opacity: 1, x: 0, ease: Quad.easeOut, force3D: true}, .2)
    },
    hide() {
      TweenMax.to(this.$el, .8, {autoAlpha: 0, ease: Quad.easeIn, force3D: true})
    }
  },
  mounted() {
    TweenMax.set(this.$el, {autoAlpha: 0})
  }
}

</script>

<style lang="stylus" scoped>
.MenuCitation
  position absolute
  display flex
  flex-wrap nowrap
  width 100%
  margin 0
  padding 0
  strong
    font-weight $light
    font-size 21 * $unitH
    color $colors-speechGrey
    width 400 * $unitH
    line-height 40 * $unitH
  p
    color $colors-white
    font-size 25 * $unitH
    line-height 40 * $unitH
    font-weight $light
  +above('hd')
    strong
      font-size 18 * $unitH
      line-height 34 * $unitH
    p
      font-size 21 * $unitH
      line-height 34 * $unitH
  +above('hd')
    strong
      font-size 18 * $unitH
      line-height 34 * $unitH
    p
      font-size 21 * $unitH
      line-height 34 * $unitH
</style>

