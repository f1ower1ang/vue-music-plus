<template>
  <div class="list" ref="list">
    <div class="list-content" ref="content">
      <cube-scroll :data="list" ref="scroll">
        <div>
          <song-list @select="playSong" @showMenu="showMn" :num="showNum" :songs="list"></song-list>
        </div>
      </cube-scroll>
    </div>
    <no-result :title="text" v-if="list.length === 0"></no-result>
    <play-menu :song="currentSong" @nextplay="addNext" @addToFavor="addFavor" ref="playMenu"></play-menu>
  </div>
</template>

<script>
  import SongList from '../../base/song-list/song-list'
  import PlayMenu from '../../base/play-menu/play-menu'
  import { mapActions } from 'vuex'
  import { playListMixin } from '../../common/js/mixin'
  import Song from '../../common/js/song'
  import NoResult from '../../base/no-result/no-result'

  export default {
    name: 'List',
    components: { SongList, PlayMenu, NoResult },
    mounted () {
      this.$refs.list.style.width = `${window.innerWidth}px`
    },
    watch: {
      clientHeight (newVal) {
        if (newVal > 0) {
          this.$refs.list.style.height = `${newVal}px`
        }
        this.$refs.scroll.$el.style.width = `${window.innerWidth}px`
      }
    },
    mixins: [playListMixin],
    data () {
      return {
        showNum: false,
        currentSong: null
      }
    },
    props: {
      text: {
        type: String,
        default: ''
      },
      list: {
        type: Array,
        default: null
      },
      clientHeight: {
        type: Number,
        default: -1
      }
    },
    methods: {
      handlePlayList (playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.content.style.bottom = bottom
        this.refresh()
      },
      addNext () { // 下一首播放
        this.addToNext(this.currentSong)
      },
      addFavor () { // 添加到我喜欢
        this.saveFavor(this.currentSong)
      },
      showMn (song) { // 显示歌曲操作菜单
        this.currentSong = song
        this.$refs.playMenu.show()
      },
      playSong (item, index) { // 播放音乐
        item = new Song(item)
        this.insertSong(item)
      },
      refresh () {
        this.$refs.scroll.refresh()
      },
      ...mapActions([
        'insertSong',
        'addToNext',
        'saveFavor'
      ])
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../common/stylus/variable.styl"
  .list
    height 100%
    box-sizing border-box

    .list-content
      position absolute
      width 100%
      top 0
      bottom 0
      overflow hidden
</style>
