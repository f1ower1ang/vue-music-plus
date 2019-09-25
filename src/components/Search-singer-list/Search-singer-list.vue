<template>
  <cube-scroll ref="scroll" class="singer-content" :data="singers">
    <ul>
      <li :key="index" v-for="(item,index) in singers" class="item" @click="selectSinger(item)">
        <img v-lazy="item.avator" class="avator" width="50" height="50" alt="">
        <span class="name" v-html="item.singer"></span>
      </li>
    </ul>
  </cube-scroll>
</template>

<script>
  import { qqSearchSongAndSinger } from '../../api/qqMusic/search'
  import { ntSearchSinger } from '../../api/NeteaseCloudMusic/search'
  import { playListMixin } from '../../common/js/mixin'

  const limit = 30

  export default {
    name: 'Search-singer-list',
    mixins: [playListMixin],
    data () {
      return {
        singers: [],
        page: 1,
        type: 'singer',
        qqHasMore: true
      }
    },
    created () {
      this.keyword = this.$route.query.keyword
      this.search()
    },
    methods: {
      handlePlayList (playList) {
        // const bottom = playList.length > 0 ? '60px' : ''
        // this.$refs.scroll.$el.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      async search () {
        let qqSinger = await qqSearchSongAndSinger('singer', this.keyword, this.page, limit)
        let ntSinger = await ntSearchSinger(this.keyword, this.page, limit)
        this.singers = this._formalize(qqSinger, ntSinger)
      },
      selectSinger (singer) {
        this.$router.push({
          path: '/search/result/singer',
          query: {
            ntId: singer.ntId,
            qqId: singer.qqId,
            qqMid: singer.qqMid
          }
        })
      },
      _formalize (qqSingers, ntSingers) {
        let ret = []
        if (qqSingers.length !== 0) {
          if (qqSingers[0].singer === ntSingers[0].singer) {
            ret.push(Object.assign({}, qqSingers[0], {
              ntId: ntSingers[0].ntId
            }))
          }
          for (let i = 1; i < ntSingers.length; i++) {
            ret.push(Object.assign({}, ntSingers[i], {
              qqId: 0,
              qqMid: 0
            }))
          }
        } else {
          for (let i = 0; i < ntSingers.length; i++) {
            ret.push(Object.assign({}, ntSingers[i], {
              qqId: 0,
              qqMid: 0
            }))
          }
        }
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"
  .singer-content
    .item
      display flex
      padding 20px 0 0 15px
      width 100%

      .avator
        display block
        width 50px
        height 50px
        border-radius 50%
        overflow hidden

      .name
        margin-left 20px
        line-height 50px
        font-size $font-size-medium
        color $color-text
        no-wrap()

</style>
