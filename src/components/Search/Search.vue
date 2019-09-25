<template>
  <transition name="slide">
    <div class="search">
<!--      搜索框-->
      <div class="search-top">
        <div class="icon" @click="back">
          <i class="icon-back"></i>
        </div>
        <div class="search-box-wrapper">
          <search-box @blur="hideSuggest" @focus="backToSearch" ref="searchBox" @keyPress="onKeyPress"
                      @query="onQueryChange"></search-box>
        </div>
      </div>
<!--      搜索推荐框-->
      <div class="suggest-wrapper" ref="suggestWp">
        <suggest :list="suggestList" :title="query.trim()" @select="selectKeyword"></suggest>
      </div>
<!--      搜索热词-->
      <div class="hot-key" ref="hotKey">
        <h2 class="title">热门搜索</h2>
        <ul>
          <li :key="index" @click="selectKey(item)" class="item" v-for="(item, index) in hotKey"
              v-html="item"></li>
        </ul>
      </div>
<!--      搜索历史-->
      <div class="history" ref="history">
        <div class="title">
          <p>搜索历史</p>
          <i class="icon-clear" @click.stop="showConfirm"></i>
        </div>
        <div class="history-wrapper">
          <history-list @select="selectKey" @delete="deleteHistory" :history="searchHistory"></history-list>
        </div>
      </div>
<!--      确认框-->
      <confirm text="是否清空所有搜索历史" @confirm="clearHistory" ref="confirm"></confirm>
      <transition name="slide">
        <router-view></router-view>
      </transition>
    </div>
  </transition>
</template>

<script>
  import SearchBox from '../../base/search-box/search-box'
  import Suggest from '../../base/suggest/suggest'
  import { getHotKey, getSuggest } from '../../api/index/search'
  import Confirm from '../../base/confirm/confirm'
  import { mapActions, mapGetters } from 'vuex'
  import HistoryList from '../../base/history-list/history-list'

  export default {
    name: 'Search',
    components: { SearchBox, Suggest, Confirm, HistoryList },
    data () {
      return {
        hotKey: [],
        query: '',
        suggestList: []
      }
    },
    watch: {
      hotKey () {
        setTimeout(() => {
          this.$refs.history.style.top = `${this.$refs.hotKey.offsetHeight + 84}px`
        }, 20)
      },
      query (newVal) {
        if (newVal.trim().length === 0) {
          this.suggestList = []
          return
        }
        getSuggest(newVal).then(res => {
          if (res.code === 200 && res.result.allMatch && res.result.allMatch.length > 0) {
            this.suggestList = res.result.allMatch
          }
        })
      }
    },
    computed: {
      ...mapGetters([
        'searchHistory'
      ])
    },
    created () {
      getHotKey().then(res => {
        this.hotKey = res
      }).catch(e => {
        console.log(e)
      })
    },
    methods: {
      showConfirm () {
        this.$refs.confirm.show()
      },
      hideSuggest () {
        setTimeout(() => {
          this.$refs.suggestWp.style.display = 'none'
        }, 20)
      },
      showSuggest () {
        setTimeout(() => {
          this.$refs.suggestWp.style.display = 'block'
        }, 20)
      },
      onQueryChange (val) {
        this.query = val
      },
      backToSearch () {
        this.$router.push('/search')
        this.showSuggest()
      },
      onKeyPress (code) {
        if (code === 13 && this.query) {
          this.$refs.searchBox.blur()
          setTimeout(() => {
            this.search(this.query)
          }, 20)
        }
      },
      back () {
        this.addQuery('')
        this.$router.back()
      },
      selectKey (key) {
        this.addQuery(key)
        this.search(key)
      },
      addQuery (val) {
        this.$refs.searchBox.setQuery(val)
      },
      selectKeyword (keyword) {
        this.addQuery(keyword)
        this.search(keyword)
      },
      search (keyword) {
        this.$refs.searchBox.blur()
        setTimeout(() => {
          this.hideSuggest()
          this.setHistory(keyword)
          this.$router.push({
            path: '/search/result',
            query: {
              keyword
            }
          })
        }, 100)
      },
      ...mapActions([
        'setHistory',
        'deleteHistory',
        'clearHistory'
      ])
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"
  .search
    position fixed
    top 0
    bottom 0
    right 0
    left 0
    width 100%
    height 100%
    background $color-icon

    .search-top
      height 44px
      margin 10px
      display flex
      align-items center

      .icon
        height 44px
        width 25px
        line-height 44px
        extend-click()

      .search-box-wrapper
        flex 1

    .hot-key
      margin 20px 10px

      .title
        color $color-text
        font-size $font-size-medium-x
        font-weight bold
        margin-bottom 20px

      ul
        .item
          background $color-text-l
          display inline-block
          color $color-text-d
          margin 0 20px 10px 0
          border-radius 10px
          padding 5px 10px
          font-size $font-size-medium

    .suggest-wrapper
      position absolute
      top 60px
      left 35px
      right 34px
      z-index 10
      background $color-icon

    .history
      position absolute
      top 320px
      bottom 0
      left 0
      right 0
      padding 0 10px

      .title
        display flex
        align-items center
        font-size $font-size-medium-x

        p
          color $color-text
          font-weight bold
          flex 1

        i
          flex 0 0 20px

      .history-wrapper
        position absolute
        bottom 0
        top 30px
        left 0
        right 0
        padding 0 10px

  .slide-enter-active, .slide-leave-active
    transition all .4s

  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
    opacity 0
</style>
