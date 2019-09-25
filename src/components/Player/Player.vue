<template>
  <div class="player" v-show="playList.length > 0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
<!--      全屏播放器-->
      <div class="normal-player" ref="normalPlayer" v-show="fullScreen">
        <div class="top">
          <div class="back" @click.stop="close">
            <i class="icon-back"></i>
          </div>
          <div class="title" ref="topTitle">
            <h2 class="song">{{currentSong.name}}</h2>
            <p class="singer">{{currentSong.singer}}</p>
          </div>
        </div>
        <div class="middle" >
<!--          专辑图片-->
          <div class="middle-l" ref="middleL">
            <div class="title">
              <h2 class="song">{{currentSong.name}}</h2>
              <p class="singer">{{currentSong.singer}}</p>
            </div>
<!--            歌曲图片-->
            <div class="wrapper">
              <div class="bg">
                <div class="cd-wrapper" ref="cdWrapper">
                  <div class="cd" :class="cdCls"
                       @click.stop="middleClick">
                    <img :src="currentSong.image" alt="">
                  </div>
                </div>
              </div>
<!--              歌曲操作控件-->
              <div class="options">
                <div class="icon">
                  <i class="icon-add"></i>
                </div>
                <div class="icon icon-center">
                  <i :class="getFavoriteIcon" @click.stop="toggleFavorite"></i>
                </div>
                <div class="icon">
                  <a href="#" @click="download" ref="download">
                    <i class="icon-download"></i>
                  </a>
                </div>
              </div>
<!--              当前播放歌词-->
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric" v-html="playingLyric"></div>
              </div>
            </div>
          </div>
<!--          歌词-->
          <div class="middle-r" ref="middleR" @click.stop="middleClick">
            <div class="wrapper" ref="wrapper">
              <scroll class="lyrics"
                      :data="currentLyric && currentLyric.lines" ref="lyrics">
                <div class="lyric-wrapper">
                  <div v-if="currentLyric">
                    <p :key="index"
                      :class="{'currentLyric':lineIndex === index}"
                       v-for="(line,index) in currentLyric.lines"
                       v-html="line.txt"
                       ref="lyric"
                    ></p>
                  </div>
                </div>
              </scroll>
              <p
                 v-show="currentLyric === null"
                 class="no-lyric"
                 v-html="lyric"></p>
            </div>
          </div>
        </div>
        <div class="bottom">
<!--          歌曲进度条-->
          <div class="progress-wrapper" @click.stop>
            <span class="time time-left">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @progressChange="changeTime" :percent="percent"></progress-bar>
            </div>
            <span class="time time-right">{{format(currentSong.duration)}}</span>
          </div>
<!--          歌曲操作按钮-->
          <div class="operators">
            <div class="icon icon-left">
              <i @click.stop="changeMode" :class="modeIcon"></i>
            </div>
            <div class="icon icon-left">
              <i class="icon-prev" @click.stop="prev"></i>
            </div>
            <div class="icon icon-center">
              <i :class="playIcon" @click.stop="togglePlay"></i>
            </div>
            <div class="icon icon-right">
              <i class="icon-next" @click.stop="next"></i>
            </div>
            <div class="icon icon-right">
              <i class="icon-playlist" @click.stop="showPlaylist"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
<!--      迷你播放器-->
      <div class="mini-player" @click="open" v-show="!fullScreen">
        <div class="icon">
          <img :class="cdCls" :src="currentSong.image" width="40" height="40" alt="">
        </div>
        <div class="text">
          <h2 class="song">{{currentSong.name}}</h2>
          <p class="singer">{{currentSong.singer}}</p>
        </div>
        <div class="control" @click.stop="togglePlay">
          <progress-circle :color="circleColor" :percent="percent">
            <i :class="miniIcon" class="mini-icon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
<!--    播放列表-->
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @ended="end" @error="error"
           @timeupdate="updateTime"></audio>
  </div>
</template>

<script>
  import { mapGetters, mapMutations, mapActions } from 'vuex'
  import animations from 'create-keyframe-animation'
  import Scroll from '../../base/scroll/scroll'
  import ProgressBar from '../../base/progress-bar/progress-bar'
  import ProgressCircle from '../../base/progress-circle/progress-circle'
  import { prefixStyle } from '../../common/js/dom'
  import Lyric from 'lyric-parser'
  import { playMode } from '../../common/js/config'
  import { shuffle } from '../../common/js/utils'
  import playlist from '../../base/playlist/playlist'

  const transform = prefixStyle('transform')

  export default {
    name: 'Player',
    data () {
      return {
        canPlay: false,
        currentLyric: null,
        currentTime: 0,
        circleColor: '#666666',
        lineIndex: 0,
        playingLyric: '',
        noLyric: true,
        left: true
      }
    },
    components: {
      Scroll, ProgressBar, ProgressCircle, playlist
    },
    computed: {
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdCls () {
        return this.playing ? 'play' : 'play pause'
      },
      modeIcon () {
        if (this.mode === playMode.sequence) {
          return 'icon-sequence'
        } else if (this.mode === playMode.loop) {
          return 'icon-loop'
        } else if (this.mode === playMode.random) {
          return 'icon-random'
        }
        return ''
      },
      lyric () {
        return this.noLyric ? '歌词加载中...' : '暂无歌词'
      },
      getFavoriteIcon () {
        if (this.isFavorite()) {
          return 'icon-favorite'
        } else {
          return 'icon-not-favorite'
        }
      },
      ...mapGetters([
        'fullScreen', // 全屏显示播放器标志
        'playList', // 播放列表
        'currentSong', // 当前播放歌曲
        'playing', // 歌曲播放标志
        'currentIndex', // 当前播放歌曲的index
        'mode', // 播放模式
        'sequenceList', // 原始歌曲播放列表
        'favoriteList' // 喜欢的歌曲列表
      ])
    },
    watch: {
      currentSong (newSong, oldSong) {
        if (!newSong.ntId && !newSong.qqId) {
          return
        }
        if (newSong.ntId === oldSong.ntId && newSong.qqId === oldSong.qqId) {
          return
        }

        if (this.timer) {
          clearTimeout(this.timer)
        }

        if (this.currentLyric) {
          this.currentLyric.stop()
        }

        this.currentLyric = null
        this.noLyric = true

        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 200)
      },
      playing (newPlay) {
        setTimeout(() => {
          let audio = this.$refs.audio
          newPlay ? audio.play() : audio.pause()
        })
      },
      canPlay (newPlay) {
        if (newPlay && this.playing && this.currentLyric) {
          setTimeout(() => {
            this.currentLyric.play()
          }, 20)
        }
      }
    },
    methods: {
      download () { // 歌曲下载
        if (this._isMobile()) {
          let link = document.createElement('a')
          link.style.display = 'none'
          link.setAttribute('href', this.currentSong.url)
          link.click()
        } else {
          let that = this
          let url = this.currentSong.url // 目标地址
          let filename = `${this.currentSong.name} - ${this.currentSong.singer}.mp3`
          let xhr = new XMLHttpRequest()
          xhr.responseType = 'blob'
          xhr.onprogress = function (progress) {
            let percent = progress.loaded / progress.total
            that.setMsgText(`正在下载：${percent.toFixed(2) * 100}%`)
            that.setMsgFlag(true)
          }
          xhr.onloadstart = function () {
            that.setMsgText('正在下载：0%')
            that.setMsgFlag(true)
          }
          xhr.onload = function () {
            if ((this.status >= 200 && this.status < 300) || this.status === 304) {
              let blob = new Blob([this.response])
              let link = document.createElement('a')
              link.style.display = 'none'
              let Url = URL.createObjectURL(blob)
              link.setAttribute('href', Url)
              link.setAttribute('download', filename)
              link.click()
              URL.revokeObjectURL(Url)
            }
          }
          xhr.open('get', url, true)
          xhr.send(null)
        }
      },
      _isMobile () { // 播放设备是否为移动端
        return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      },
      showPlaylist () { // 显示播放列表
        this.$refs.playlist.show()
      },
      toggleFavorite () { // 改变当前歌曲的喜欢状态
        if (this.isFavorite()) {
          this.deleteFavor(this.currentSong)
        } else {
          this.setMsgFlag(true)
          this.setMsgText('已添加至我喜欢')
          this.saveFavor(this.currentSong)
        }
      },
      isFavorite () { // 是否为我喜欢的歌曲
        let index = this.favoriteList.findIndex(item => {
          return item.ntId === this.currentSong.ntId && item.qqId === this.currentSong.qqId
        })
        return index > -1
      },
      middleClick () { // 切换歌词、播放器
        this.left = !this.left
        this.$refs.middleL.style.opacity = this.left ? 1 : 0
        this.$refs.middleL.style.zIndex = this.left ? 0 : -1
        this.$refs.middleR.style.opacity = this.left ? 0 : 1
        this.$refs.middleR.style.zIndex = this.left ? -1 : 0
        this.$refs.topTitle.style.opacity = this.left ? 0 : 1
      },
      changeMode () { // 修改播放模式
        let mode = (this.mode + 1) % 3
        let text = ''
        this.setMsgFlag(true)
        this.setMode(mode)
        let list = []
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
          text = '随机播放'
        } else {
          list = this.sequenceList
          if (mode === playMode.sequence) {
            text = '顺序播放'
          } else {
            text = '单曲循环'
          }
        }
        this.setMsgText(text)
        let index = list.findIndex(item => {
          return item.ntId === this.currentSong.ntId && item.qqId === this.currentSong.qqId
        })
        this.setCurrentIndex(index)
        this.setPlayList(list)
      },
      end () { // 歌曲播放结束进行的操作
        if (this.mode === playMode.loop) { // 单曲循环
          this.loop()
        } else { // 其他模式，播放下一首
          this.next()
        }
      },
      changeTime (percent) { // 滑动滚动条修改歌曲时间
        this.$refs.audio.currentTime = percent * this.currentSong.duration
        this.currentLyric && this.currentLyric.seek(percent * this.currentSong.duration * 1000)
        if (!this.playing) {
          this.togglePlay()
        }
      },
      getLyric () { // 获取歌词
        this.currentSong.getLyric().then(lyric => {
          if (lyric !== '') {
            this.currentLyric = new Lyric(lyric, this.handleLyric)
            this.currentLyric.seek(0)
            this.noLyric = false
          } else {
            this.currentLyric = null
            this.lineIndex = 0
            this.playingLyric = ''
            this.noLyric = true
          }
        })
      },
      handleLyric ({ lineNum, txt }) { // 处理歌词
        this.lineIndex = lineNum
        const index = Math.floor(this.$refs.wrapper.clientHeight / 80)
        if (lineNum > index) {
          let lineEl = this.$refs.lyric[lineNum - index]
          this.$refs.lyrics.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyrics.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      ready () { // 歌曲开始播放
        this.savePlayHis(this.currentSong)
        this.canPlay = true
      },
      error () { // 处理歌曲播放错误
        this.canPlay = true
        this.next()
      },
      updateTime (e) { // 更新歌曲时间
        this.currentTime = e.target.currentTime
      },
      format (interval) { // 格式化歌曲播放时间
        interval = interval | 0

        let minute = this._pad(interval / 60 | 0)

        let second = this._pad(interval % 60)

        return `${minute}:${second}`
      },
      _pad (num, n = 2) { // 位数不够添0
        let len = num.toString().length
        if (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      loop () { // 循环播放
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        this.currentLyric && this.currentLyric.seek(0)
      },
      next () { // 播放下一首
        if (!this.canPlay) {
          return
        }
        this.playingLyric = ''
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1 === this.playList.length ? 0 : this.currentIndex + 1
          this.setCurrentIndex(index)
        }

        if (!this.playing) {
          this.togglePlay()
        }

        this.canPlay = false
      },
      prev () { // 播放上一首
        if (!this.canPlay) {
          return
        }
        this.playingLyric = ''
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1 < 0 ? this.playList.length - 1 : this.currentIndex - 1
          this.setCurrentIndex(index)
        }

        if (!this.playing) {
          this.togglePlay()
        }

        this.canPlay = false
      },
      togglePlay () { // 修改播放状态
        if (!this.canPlay) {
          return
        }
        this.circleColor = this.playing ? '#000' : '#666666'
        this.setPlaying(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      close () { // 取消全屏显示播放器
        this.setFullScreen(false)
      },
      open () { // 全屏播放
        this.setFullScreen(true)
      },
      enter (el, done) { // 进入全屏播放器时的动画
        let { x, y, scale } = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: 'translate3d(0,0,0) scale(1.1)'
          },
          100: {
            transform: 'translate3d(0,0,0) scale(1)'
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter () { // 进入全屏播放器后的操作
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave (el, done) { // 离开全屏播放器的动画
        this.$refs.cdWrapper.style.transition = 'all .4s'
        const { x, y, scale } = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave () { // 离开全屏播放器后的操作
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ``
      },
      _getPosAndScale () {
        const targetWidth = 40
        const width = window.innerWidth * 0.8
        const paddingLeft = 40
        const paddingBottom = 30
        const marginTop = 100
        let x = paddingLeft - window.innerWidth / 2
        let y = window.innerHeight - marginTop - width / 2 - paddingBottom
        let scale = targetWidth / width
        return {
          x, y, scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULLSCREEN',
        setPlaying: 'SET_PLAYING',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setMode: 'SET_MODE',
        setPlayList: 'SET_PLAYLIST',
        setMsgFlag: 'SET_SHOW_MESSAGE',
        setMsgText: 'SET_MESSAGE_TEXT'
      }),
      ...mapActions([
        'saveFavor',
        'deleteFavor',
        'savePlayHis'
      ])
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"
  .player
    .normal-player
      position fixed
      top 0
      bottom 0
      left 0
      right 0
      width 100%
      height 100%
      z-index 150
      background $color-icon

      .top
        margin-top 5px
        height 40px
        width 100%
        display flex
        text-align center
        align-items top
        .back
          width 30px
          height 30px
          flex 0 0 30px
          font-size $font-size-medium-x
          line-height 30px
          text-align center
          box-sizing border-box
          margin-left 5%
          border-radius 50%
          background: rgba(0, 0, 0, .4)
          transform rotate(-90deg)

          .icon-back
            color $color-icon
        .title
          line-height 20px
          width 75%
          opacity 0

          .song
            color $color-text
            font-size $font-size-medium
            font-weight 700
            no-wrap()

          .singer
            color $color-text-d
            font-size $font-size-small
            no-wrap()

      .middle
        position relative
        height 100%
        width 100%

        .middle-l
          position absolute
          top 0
          bottom 135px
          width 100%
          transition all .4s

          .title
            margin-top 5px
            width 80%
            margin-left 10%
            height 40px
            text-align center
            line-height 20px

            .song
              color $color-text
              font-size $font-size-medium-x
              font-weight 700
              no-wrap()

            .singer
              color $color-text-d
              font-size $font-size-small
              no-wrap()

          .wrapper
            margin-top 25px
            width 100%

            .bg
              position relative
              width 100%
              height 0
              padding-top 80%

              .cd-wrapper
                position absolute
                top 0
                width 80%
                left 10%
                height 100%

                .cd
                  width 100%
                  height 100%
                  box-sizing border-box
                  background-image: url('./play_disc.png')
                  background-size 104% 104%
                  background-position center center
                  border-radius 50%
                  overflow hidden
                  position relative
                  box-shadow: 0 0 15px black

                  &.play
                    animation: rotate 20s linear infinite

                  &.pause
                    animation-play-state: paused

                  img
                    top 50%
                    left 50%
                    position relative
                    display block
                    transform translate(-50%, -50%)
                    vertical-align middle
                    border-radius 50%
                    width 70%
                    height 70%
            .options
              width 50%
              margin 30px auto 40px
              display flex
              .icon
                text-align: center
                flex 1
                .icon-favorite
                  color $color-theme
            .playing-lyric-wrapper
              width 80%
              margin 0 auto
              text-align center
              overflow hidden
              no-wrap()

              .playing-lyric
                color $color-text-d
                line-height 16px
                font-size $font-size-medium

        .middle-r
          transition all .4s
          position absolute
          z-index -1
          top 0
          bottom 150px
          width 100%
          opacity 0

          .wrapper
            height 100%
            width 80%
            margin-left 10%

            .lyrics
              width 100%
              height 100%
              overflow hidden
              position relative

              p
                height 40px
                line-height 40px
                font-size $font-size-medium
                text-align center
                no-wrap()
                color $color-text-d

                &.currentLyric
                  color $color-theme

            .no-lyric
              position absolute
              top 50%
              transform translateY(-50%)
              height 40px
              width 80%
              left 10%
              text-align center
              line-height 40px
              font-size $font-size-medium
              color $color-text-d

      .bottom
        width 100%
        position absolute
        bottom 20px

        .progress-wrapper
          display flex
          width 80%
          margin 0 auto
          align-items center
          padding 10px 0

          .time
            width 30px
            line-height 30px
            flex 0 0 30px
            color $color-text
            font-size $font-size-small

            &.time-left
              text-align right

            &.time-right
              text-align left

          .progress-bar-wrapper
            flex 1
            padding 0 12px

        .operators
          width 100%
          display flex
          align-items center

          .icon
            flex 1
            color $color-text
            font-size 30px

            &.icon-left
              text-align right

            &.icon-center
              text-align center
              padding 0 20px
              font-size 32px

            &.icon-right
              text-align left


      &.normal-enter-active, &.normal-leave-active
        transition all .4s

        .back, .title, .bottom
          transition: all .4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

      &.normal-enter, &.normal-leave-to
        opacity 0

        .back, .title
          transform translate3d(0, -100px, 0)

        .bottom
          transform translate3d(0, 100px, 0)

    .mini-player
      position fixed
      bottom 0
      left 0
      right 0
      width 100%
      background $color-icon
      height 60px
      display flex
      align-items center
      z-index 150

      .icon
        flex 0 0 40px
        width 40px
        padding 0 10px 0 20px

        img
          border-radius 50%

          &.play
            animation: rotate 20s linear infinite

          &.pause
            animation-play-state: paused

      .text
        flex 1
        text-align left
        line-height 20px
        width 100%
        no-wrap()

        .song
          color $color-text
          font-size $font-size-medium

        .singer
          color $color-text-d
          font-size $font-size-small

      .control
        flex 0 0 30px
        width 30px
        padding 0 10px
        font-size 25px

        .mini-icon
          position absolute
          top 0
          left 0
          font-size 32px

          &.icon-play-mini
            color $color-text

          &.icon-pause-mini
            color $color-theme

      &.mini-enter-active, &.mini-leave-active
        transition all .4s

      &.mini-enter, &.mini-leave-to
        transform translate3d(0, 60px, 0)
        opacity 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
