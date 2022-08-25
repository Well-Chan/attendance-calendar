module.exports = {
  plugins: {
    "postcss-px-to-viewport": {
      unitToConvert: "px", // 默认值`px`，需要转换的单位
      viewportWidth: 360,//视窗的宽度，对应的是我们设计稿的宽度
      viewportUnit: 'vw',//指定需要转换成的视窗单位，建议使用vw
      fontViewportUnit: 'vw', //指定字体需要转换成的视窗单位，默认vw;
      minPixelValue: 0.5,// 小于或等于`1px`不转换为视窗单位
      mediaQuery: false,// 允许在媒体查询中转换`px`，默认false
      exclude:[/\/node_modules\/(?!(vant|element-plus))/], //如果是regexp, 忽略全部匹配文件;如果是数组array, 忽略指定文件.
    }
  }
}