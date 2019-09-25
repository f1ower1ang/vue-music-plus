<template>
  <div class="song-list">
    <cube-scroll :options="scrollOptions"
                 @pulling-up="searchMore"
                 ref="scroll"
                 :data="songs"
    >
      <div>
        <div class="play" @click="_randomPlay">
          <i class="icon-play-m"></i>
          <p>播放全部</p>
        </div>
        <cube-loading class="loading" v-show="songs.length === 0"></cube-loading>
        <ul class="list">
          <li :key="index" v-for="(song,index) in songs" @click="playSong(song)" class="item">
            <div class="rank">
              <span>{{index + 1}}</span>
            </div>
            <div class="content">
              <h2 class="name" v-html="song.name"></h2>
              <p class="desc" v-html="getDesc(song)"></p>
            </div>
            <div class="icon" @click.stop="showMenu(song)">
              <i class="icon-menu"></i>
            </div>
          </li>
        </ul>
      </div>
    </cube-scroll>
    <play-menu @nextplay="addNext" @addToFavor="addFavor" ref="playMenu"
               :song="selectedSong"></play-menu>

  </div>
</template>

<script>
  import { ntSearchSong } from '../../api/NeteaseCloudMusic/search'
  import { qqSearchSongAndSinger } from '../../api/qqMusic/search'
  import { createSong } from '../../common/js/song'
  import { playListMixin } from '../../common/js/mixin'
  import { mapActions } from 'vuex'
  import PlayMenu from '../../base/play-menu/play-menu'

  const limit = 20

  export default {
    name: 'Search-song-list',
    components: { PlayMenu },
    mixins: [playListMixin],
    data () {
      return {
        songs: [],
        page: 1,
        type: 'song',
        qqHasMore: true,
        ntHasMore: true,
        hasMore: true,
        selectedSong: null,
        scrollOptions: {
          directionLockThreshold: 0,
          pullUpLoad: {
            threshold: 0
          }
        }
      }
    },
    created () {
      this.keyword = this.$route.query.keyword
      this.search()
    },
    watch: {
      clientHeight (newVal) {
        this.$refs.songList.style.height = newVal + 'px'
      }
    },
    methods: {
      searchMore () {
        if (!this.hasMore) {
          this.$refs.scroll.forceUpdate()
        } else {
          this.page++
          this.search()
        }
      },
      addNext (song) {
        this.addToNext(song)
      },
      addFavor (song) {
        this.saveFavor(song)
      },
      showMenu (song) {
        this.selectedSong = song
        this.$refs.playMenu.show()
      },
      handlePlayList (playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.scroll.$el.style.top = 0
        this.$refs.scroll.$el.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      playSong (song) {
        this.insertSong(song)
      },
      async search () {
        if (!this.hasMore) {
          return
        }
        let qqSongs = []
        let ntSongs = []
        let songs = []
        if (this.qqHasMore) {
          qqSongs = await qqSearchSongAndSinger('song', this.keyword, this.page, limit)
          // console.log('1: ' + qqSongs)
          if (qqSongs.length < limit) {
            this.qqHasMore = false
          }
        }
        if (this.ntHasMore) {
          ntSongs = await ntSearchSong(this.keyword, this.page, limit)
          // console.log('3: ' + ntSongs)
          if (ntSongs.length < limit) {
            this.ntHasMore = false
          }
        }

        let length = Math.max(ntSongs.length, qqSongs.length)
        for (let i = 0; i < length; i++) {
          if (ntSongs[i]) {
            songs.push(ntSongs[i])
          }
          if (qqSongs[i]) {
            songs.push(qqSongs[i])
          }
        }

        songs = this._formalize(songs)

        this.hasMore = (this.qqHasMore || this.ntHasMore) && this._checkMore(songs)

        if (!this.hasMore) {
          this.ntHasMore = this.qqHasMore = false
        }
        this.songs = this.songs.concat(songs)
      },
      getDesc (song) {
        return `${song.singer}· ${song.album}`
      },
      _checkMore (list) {
        for (let i = 0; i < list.length; i++) {
          let index = this.songs.findIndex(item => {
            return list[i].qqId === item.qqId && item.ntId === list[i].ntId
          })
          if (index > -1) {
            return false
          }
        }
        return true
      },
      _randomPlay () {
        this.randomPlay({ list: this.songs })
      },
      _formalize (songs) {
        let newSongs = songs.slice()
        for (let i = 0; i < newSongs.length; i++) {
          newSongs[i] = createSong(newSongs[i])
        }
        return newSongs
      },
      ...mapActions([
        'randomPlay',
        'insertSong',
        'addToNext',
        'saveFavor'
      ])
    }
  }
</script>

<style lang="stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"
  .song-list
    width 100%
    height 100%
    overflow hidden

    .play
      display flex
      align-items center
      height 40px
      width 100%
      padding 0 10px
      box-sizing border-box

      p
        flex 1
        font-size $font-size-medium-x
        text-align left

      i
        text-align center
        flex 0 0 25px
        margin-right 10px
        font-size $font-size-large
    .list
      .item
        display flex
        height 64px
        padding 0 20px 0 10px
        align-items center
        font-size $font-size-medium
        .rank
          flex 0 0 25px
          text-align center
          margin-right 10px
          color $color-text-d
          font-size $font-size-large
          .top
            color $color-theme
        .icon
          flex 0 0 25px
          extend-click()
    .loading
      width 100%
      height 100%
      .cube-loading-spinners
        margin 0 auto
  .content
    flex 1
    line-height 20px
    overflow hidden
    text-align left
    width 100%
    no-wrap()

    .name
      color $color-text
      no-wrap()

    .desc
      font-size $font-size-small
      color $color-text-d
      no-wrap()

</style>
