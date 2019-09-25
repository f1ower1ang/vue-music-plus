<template>
  <cube-scroll ref="scroll"
               @pulling-down="refresh"
               :options="scrollOptions"
               @pulling-up="searchMore"
               :data="discs">
    <ul class="list">
      <li :key="index" v-for="(item, index) in discs" class="item" @click="selectDisc(item)">
        <img v-lazy="item.imgUrl" class="avator" width="50" height="50" alt="">
        <div class="info">
          <h2 class="title" v-html="item.discName.trim()"></h2>
          <p class="desc">{{item.count}}首 播放{{item.playNum}}次</p>
        </div>
      </li>
    </ul>
  </cube-scroll>
</template>

<script>
  import { playListMixin } from '../../common/js/mixin'
  import { ntSearchDisc } from '../../api/NeteaseCloudMusic/search'

  const limit = 30

  export default {
    name: 'Search-disc-list',
    mixins: [playListMixin],
    data () {
      return {
        discs: [],
        page: 1,
        type: 'list',
        scrollOptions: {
          directionLockThreshold: 0,
          pullDownRefresh: {
            threshold: 60,
            txt: '刷新成功'
          },
          pullUpLoad: {
            threshold: 0
          }
        }
      }
    },
    created () {
      this.keywords = this.$route.query.keyword
      this.search()
    },
    watch: {
      keywords () {
        if (this.discs.length === 0) {
          this.search()
        }
      }
    },
    methods: {
      refresh () {
        setTimeout(() => {
          this.$refs.scroll.forceUpdate()
          this.page = 1
          this.hasMore = true
          setTimeout(() => {
            this.discs = []
            this.search()
          }, 600)
        }, 1000)
      },
      handlePlayList (playList) {
        // const bottom = playList.length > 0 ? '60px' : ''
        // this.$refs.scroll.$el.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectDisc (item) {
        this.$router.push({
          path: '/search/result/disc',
          query: {
            type: item.type,
            id: item.discId
          }
        })
      },
      async search () {
        let ntInfo = {
          count: 0,
          list: []
        }
        ntInfo = await ntSearchDisc(this.keywords, this.page, limit)
        this.hasMore = this._checkMore(this.discs, ntInfo.list)
        this.discs = this.discs.concat(ntInfo.list)
      },
      searchMore () {
        setTimeout(() => {
          if (!this.hasMore) {
            this.$refs.scroll.forceUpdate()
            return
          } else {
            this.page++
          }
          this.search()
        }, 1000)
      },
      _checkMore (discs, list) {
        if (list.length === 0 || list.length < limit) {
          return false
        }
        for (let i = 0; i < list.length; i++) {
          let index = discs.findIndex(item => {
            return item.discId === list[i].discId
          })
          if (index > 0) {
            return false
          }
        }
        return true
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable.styl"
  .list
    overflow hidden

    .item
      width 100%
      display flex
      padding 20px 0 0 15px

      .avator
        display block
        width 50px
        height 50px
        border-radius 4px
        overflow hidden

      .info
        margin-left 20px
        line-height 50px
        font-size $font-size-medium
        color $color-text
        text-align left
        no-wrap()

        .title
          line-height 30px
          color $color-text
          font-size $font-size-medium

        .desc
          line-height 15px
          color $color-text-d
          font-size $font-size-small

</style>
