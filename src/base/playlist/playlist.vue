<template>
  <transition name="drop">
    <div class="playlist" v-show="showFlag" @click="hidden">
      <div class="wrapper" ref="wrapper" @click.stop>
        <div class="title" @click.stop>
          <p class="left" @click.stop="changeMode">
            <i class="icon" :class="modeIcon"></i>
            <span>{{currentMode()}}</span>
            <span class="num">({{playList.length}})</span>
          </p>
          <p class="right">
            <i class="icon-clear" @click.stop="showConfirm"></i>
          </p>
        </div>
        <scroll class="list" :data="playList" ref="list">
          <ul>
            <li :key="index" @click.stop="playSong(index)" class="item" ref="listItem"
                :class="index === currentIndex ? 'current' : ''"
                v-for="(song,index) in playList">
              <i :class="index === currentIndex ? 'icon-play' : ''"></i>
              <p class="name">{{song.name}}<span> - {{song.singer}}</span></p>
              <i class="icon-delete" @click.stop="deleteSong({song, index})"></i>
            </li>
          </ul>
        </scroll>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" @confirm="clearSong"></confirm>
    </div>
  </transition>
</template>

<script>
  import Scroll from '../scroll/scroll'
  import { mapActions, mapGetters, mapMutations } from 'vuex'
  import { playMode } from '../../common/js/config'
  import { shuffle } from '../../common/js/utils'
  import Confirm from '../confirm/confirm'

  export default {
    name: 'playlist',
    components: { Scroll, Confirm },
    data () {
      return {
        showFlag: false
      }
    },
    mounted () {
      this.$refs.wrapper.style.top = `${window.innerWidth * 0.7 - 25}px` // 设置播放列表距离顶部高度
    },
    computed: {
      // eslint-disable-next-line vue/return-in-computed-property
      modeIcon () { // 计算当前播放模式图标类名
        if (this.mode === playMode.random) {
          return 'icon-random'
        } else if (this.mode === playMode.sequence) {
          return 'icon-sequence'
        } else if (this.mode === playMode.loop) {
          return 'icon-loop'
        }
      },
      ...mapGetters([
        'mode', // 播放模式
        'playList', // 播放列表
        'currentIndex', // 当前播放歌曲的index
        'sequenceList', // 原始的歌曲列表
        'currentSong' // 当前播放歌曲
      ])
    },
    watch: {
      currentIndex (newVal, oldVal) {
        if (newVal === -1) { // 播放列表为空，并且隐藏组件
          this.showFlag = false
        }
        if (newVal === -1 || oldVal === newVal) { // 播放列表只有一首歌，返回不操作
          return
        }
        this.scrollToTop() // 将当前播放的歌曲滚动到组件顶部
      },
      showFlag (newVal) {
        if (newVal) { // 组件一显示就将当前播放歌曲滚动到组件顶部
          this.scrollToTop()
        }
      }
    },
    methods: {
      showConfirm () { // 显示确认框
        this.$refs.confirm.show()
      },
      scrollToTop () { // 将当前播放的歌曲滚动到播放列表组件的顶部
        setTimeout(() => {
          this.$refs.list.refresh()
          this.$refs.list.scrollToElement(this.$refs.listItem[this.currentIndex], 300)
        }, 20)
      },
      show () { // 显示组件
        this.showFlag = true
        setTimeout(() => {
          this.$refs.list.refresh()
        }, 20)
      },
      hidden () { // 隐藏组件
        this.showFlag = false
      },
      playSong (index) { // 播放选中歌曲
        this.setCurrentIndex(index)
        this.setPlaying(true)
      },
      changeMode () { // 改变播放模式
        let mode = (this.mode + 1) % 3
        this.setMode(mode)
        let list = []
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        let index = list.findIndex(item => {
          return item.ntId === this.currentSong.ntId && item.qqId === this.currentSong.qqId
        })
        this.setPlayList(list)
        this.setCurrentIndex(index)
      },
      currentMode () {
        let text = ''
        if (this.mode === playMode.random) {
          text = '随机播放'
        } else if (this.mode === playMode.sequence) {
          text = '顺序播放'
        } else if (this.mode === playMode.loop) {
          text = '循坏播放'
        }
        return text
      },
      ...mapMutations({
        setMode: 'SET_MODE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayList: 'SET_PLAYLIST',
        setPlaying: 'SET_PLAYING'
      }),
      ...mapActions([
        'clearSong',
        'deleteSong'
      ])
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"
  .playlist
    position fixed
    top 0
    bottom 0
    left 0
    right 0
    background rgba(0, 0, 0, .4)
    z-index 200

    .wrapper
      position absolute
      background $color-icon
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      bottom 0
      width 100%
      transition all .4s

      .title
        position absolute
        display flex
        top 0
        height 45px
        padding 0 20px 0 10px
        left 0
        right 0
        border-bottom 1px solid rgba(0, 0, 0, .1)
        align-items center

        .left
          display flex
          align-items center
          width 130px
          font-size $font-size-medium-x

          .icon
            flex 0 0 25px
            padding-right 5px
            font-size 22px

          .num
            font-size $font-size-small
            color $color-text-d

        .right
          flex 1
          text-align right

          .icon-clear
            padding-right 6px

      .list
        position absolute
        top 45px
        bottom 0
        left 0
        right 0
        padding 0 20px 0 15px
        overflow hidden

        .item
          height 45px
          display flex
          align-items center
          color $color-text
          font-size $font-size-medium
          no-wrap()

          .icon-delete
            flex 0 0 20px
            color $color-text-d

          .icon-play
            flex 0 0 20px

          .name
            flex 1
            no-wrap()
            span
              color $color-text-d
              font-size $font-size-small-s
          &.current
            color $color-theme
            .name
              span
                color $color-theme
      .bottom
        position absolute
        bottom 0
        height 40px
        left 0
        right 0
        text-align center
        font-size $font-size-medium-x
        line-height 40px
        border-top 1px solid rgba(0, 0, 0, .1)
        transition all .4s

      .bottom:active
        background rgba(0, 0, 0, .1)

    &.drop-enter-active, &.drop-leave-active
      transition all .4s

    &.drop-enter, &.drop-leave-to
      opacity 0

      .wrapper
        transform translate3d(0,400px,0)
</style>
