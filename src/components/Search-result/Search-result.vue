<template>
  <div class="search-result">
    <cube-tab-bar v-model="selectedLabel"
                  show-slider
                  :use-transition="disabled"
                  ref="tabNav"
                  :data="tab"
    ></cube-tab-bar>
    <div class="tab-slide-container" ref='content'>
      <cube-slide ref="slide"
                  :initial-index="initialIndex"
                  :options="slideOptions"
                  @scroll="scroll"
                  @change="changePage"
                  :auto-play="autoPlay"
                  :show-dots="showDots"
                  :loop="loop">
        <cube-slide-item>
          <search-song-list></search-song-list>
        </cube-slide-item>
        <cube-slide-item>
          <search-singer-list></search-singer-list>
        </cube-slide-item>
        <cube-slide-item>
          <search-disc-list></search-disc-list>
        </cube-slide-item>
      </cube-slide>
    </div>
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import SearchSongList from '../Search-song-list/Search-song-list'
  import SearchSingerList from '../Search-singer-list/Search-singer-list'
  import SearchDiscList from '../Search-disc-list/Search-disc-list'

  export default {
    name: 'Search-result',
    components: { SearchSongList, SearchSingerList, SearchDiscList },
    data () {
      return {
        selectedLabel: '单曲',
        disabled: false,
        tab: [{
          label: '单曲'
        }, {
          label: '歌手'
        }, {
          label: '歌单'
        }],
        slideOptions: {
          listenScroll: true,
          probeType: 3,
          directionLockThreshold: 0
        }
      }
    },
    created () {
      this.loop = false
      this.showDots = false
      this.autoPlay = false
    },
    computed: {
      initialIndex () {
        let index = 0
        index = this.tab.findIndex(item => item.label === this.selectedLabel)
        return index
      }
    },
    methods: {
      changePage (current) {
        this.selectedLabel = this.tab[current].label
      },
      scroll (pos) {
        const x = Math.abs(pos.x)
        const tabItemWidth = this.$refs.tabNav.$el.clientWidth
        const slideScrollerWidth = this.$refs.slide.slide.scrollerWidth
        const deltaX = x / slideScrollerWidth * tabItemWidth
        this.$refs.tabNav.setSliderTransform(deltaX)
      },
      setIndex (index) {
        this.currentIndex = index
      },
      scrollTo (index) {
        this.$refs.slider._scrollTo(index)
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable.styl"
  .search-result
    position fixed
    top 55px
    bottom 0
    left 0
    right 0
    background $color-icon

    .tab-slide-container
      position absolute
      top 30px
      bottom 0
      left 0
      right 0

    .slide-enter-active, .slide-leave-active
      transition all .4s

    .slide-enter, .slide-leave-to
      transform translate3d(100%, 0, 0)
</style>
