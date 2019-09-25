module.exports = {
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        'import': [
          './src/theme'
        ]
      }
    }
  },
  pluginOptions: {
    'cube-ui': {
      postCompile: true,
      theme: true
    }
  },
  devServer: {
    open: false,
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    // proxy: {
    //     // 设置代理
    //     // proxy all requests starting with /api to jsonplaceholder
    //     'http://localhost:8080/': {
    //         target: 'http://baidu.com:8080', //真实请求的目标地址
    //         changeOrigin: true,
    //         pathRewrite: {
    //             '^http://localhost:8080/': ''
    //         }
    //     }
    // },
    before: (app) => {}
  },
  publicPath: './'
}
