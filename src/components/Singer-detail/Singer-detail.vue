<template>
  <music-list :song-list="songList" :title="singer.singer">
    <div class="bg-image" ref="bgImage">
      <img class="bg" :src="singer.image" alt="">
      <div class="filter"></div>
    </div>
  </music-list>
</template>

<script>
  import MusicList from '../../components/Music-list/Music-list'
  // import {mapGetters} from 'vuex'
  import { getSingerDetail } from '../../api/index/singer'
  import { getSongUrl } from '../../api/index/song'
  import { createSong } from '../../common/js/song'

  export default {
    name: 'Singer-detail',
    components: { MusicList },
    data () {
      return {
        songList: [],
        singer: {}
      }
    },
    created () {
      this._getDetail()
    },
    methods: {
      async _getDetail () {
        const query = this.$route.query
        let ntId = query.ntId
        let qqId = query.qqId
        let qqMid = query.qqMid
        let data = await getSingerDetail(ntId, qqId, qqMid)
        this.singer = {
          singer: data.singer,
          image: data.imgUrl
        }
        this.songList = this._normalizeSongs(data.list)
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach(async item => {
          let url = await getSongUrl(item.qqMid, item.ntId)

          item = Object.assign({}, item, {}, {
            url
          })
          ret.push(createSong(item))
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../common/stylus/variable.styl"
  .bg-image
    position relative
    width 100%
    height 0
    padding-top 70%
    background-size: 100%;
    background-repeat no-repeat
    z-index -1
    overflow hidden
    transform-origin top

    .bg
      width 100%
      position absolute
      top 0
      left 0

    .filter
      position absolute
      top 0
      left 0
      bottom 0
      right 0
      background rgba(7, 17, 27, 0.4);

</style>
