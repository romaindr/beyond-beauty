var path = require('path')
module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'beyond-beauty',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  router: {
    base: process.env.NODE_ENV === 'dev' ? '/' : '/beyond-beauty/'
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  plugins: [
    '~plugins/vuex-router-sync.js'
  ],
  generate: {
    routes: function () {
      var routes_array = []
      var data = JSON.parse(require('fs').readFileSync(`./assets/data.json`, 'utf-8'))
      for (let index = 0; index < data.pages.length; index++) {
        routes_array.push('/story/'+data.pages[index].pageId)

      }
      return routes_array
    }
  },
  build: {
    /*
    ** Run ESLint on save
    */
    vendor: ['~/assets/js/utils/Scroll'],
    extend (config, { isDev, isClient }) {
      var stylus = config.module.rules[0].options.loaders.stylus.find( e => e.loader == 'stylus-loader');
        // extend default options
        Object.assign(stylus.options, {
          import: [
            /*'~nib/index.styl',
            '~rupture/rupture/index.styl',*/
            // require my own configs and variables and mixins and ..
            path.resolve(__dirname, 'assets/stylus/main.styl')
          ]
        })
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
