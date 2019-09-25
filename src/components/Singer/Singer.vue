<template>
  <transition name="fade">
    <div class="singer-page" ref="singer">
      <cube-index-list :data="singerList" ref="list">
        <cube-index-list-group v-for="(group, index) in singerList" :key="index"
                               :group="group" class="list-group">
          <cube-index-list-item v-for="(item, index) in group.items" :key="index"
                                :item="item"
                                @select="selectSinger" class="list-group-item">
            <img class="avatar" v-lazy="item.avator">
            <span class="name">{{item.singer}}</span>
          </cube-index-list-item>
        </cube-index-list-group>
      </cube-index-list>
      <div class="loading-wrapper">
        <loading v-show="singerList.length === 0"></loading>
      </div>
      <transition name="slide">
        <router-view></router-view>
      </transition>
    </div>
  </transition>
</template>

<script>
  import { getSingerList } from '../../api/index/singer'
  import { mapMutations } from 'vuex'
  import { playListMixin } from '../../common/js/mixin'
  import jpy from 'js-pinyin'
  import Loading from '../../base/loading/loading'

  const HOT_LEN = 20
  const HOT_NAME = '热门'

  export default {
    name: 'Singer',
    mixins: [ playListMixin ],
    components: { Loading },
    data () {
      return {
        singerList: []
      }
    },
    created () {
      getSingerList().then(res => {
        this.singerList = this._normalizeSingerList(res) // 将获取的数据格式化
      })
    },
    methods: {
      handlePlayList (playList) {
        const bottom = playList && playList.length > 0 ? '60px' : 0
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger (singer) {
        let qqId = singer.qqId ? singer.qqId : 0
        let qqMid = singer.qqMid ? singer.qqMid : 0
        let ntId = singer.ntId ? singer.ntId : 0
        this.$router.push({
          path: `/singer/detail`,
          query: {
            qqId,
            qqMid,
            ntId
          }
        })
        this.setSinger(singer)
      },
      _normalizeSingerList (list) { // 格式化歌手数据
        let hot = [] // 热门歌手
        let ret = [] // 按歌手首字母组成的列表
        let map = { // 总体数据，便于分类
          hot: {
            name: HOT_NAME,
            items: []
          }
        }
        if (list.length) {
          for (let i = 0; i < list.length; i++) {
            const key = jpy.getFullChars(list[i].singer).charAt(0).toUpperCase() // 获取歌手首字母
            if (i < HOT_LEN) { // 将列表前HOT_LEN个数据加入热门歌手
              map.hot.items.push(list[i])
            }
            if (!map[key]) {
              map[key] = {
                name: key,
                items: []
              }
            }
            map[key].items.push(list[i])
          }
          for (let k in map) { // 将map中的数据分类
            let val = map[k]
            if (val.name.match(/[A-Z]/)) {
              ret.push(val)
            } else {
              hot.push(val)
            }
          }
          ret.sort((a, b) => {
            return a.name.charCodeAt(0) - b.name.charCodeAt(0)
          })
        }
        return hot.concat(ret)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    }
  }
</script>

<style lang="stylus">
  @import "../../common/stylus/variable.styl"
  .singer-page
    position fixed
    top 110px
    bottom 0
    width 100%

    .cube-index-list-anchor
      padding 8px 16px

    .list-group-item
      display flex
      align-items center
      padding 10px 20px

      .avatar
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

    .slide-enter-active, .slide-leave-active
      transition all .3s

    .slide-enter, .slide-leave-to
      transform translate3d(100%, 0, 0)

    .loading-wrapper
      position absolute
      top 50%
      width 100%
      transform translateY(-50%)

  .fade-enter-active, .fade-leave-active
    transition all .4s

  .fade-enter, .fade-leave-to
    opacity 0
</style>
