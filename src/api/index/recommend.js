import { qqGetDisc, qqGetSongList } from '../qqMusic/recommend'
import { ntGetDisc, ntGetRecommend, ntGetSongList } from '../NeteaseCloudMusic/recommend'
import { ERR_OK } from '../qqMusic/config'
import { filterSliders, formalizeDisc, formalizeSlider } from '../../common/js/recommend'
import { shuffle } from '../../common/js/utils'
import { formalizeSong } from './singer'

export async function _getRecommend () {
  let sliders = []

  // qqGetRecommend().then((res) => {
  //   if (res.code === ERR_OK) {
  //     let banners = res.data.slider.slice(0,3)
  //     banners.forEach(item => {
  //       sliders.push(formalizeSlider(item,'qq'))
  //     })
  //   }
  // })

  let res = await ntGetRecommend()
  let banners = filterSliders(res.banners).slice()

  banners.forEach(item => {
    sliders.push(formalizeSlider(item, 'nt'))
  })

  return Promise.resolve(sliders)
}

export async function _getDiscList () {
  let discs = []
  // ntGetDisc().then(res => {
  //   let ntDiscs = []
  //   res.playlists.forEach((item) => {
  //     ntDiscs.push(formalizeDisc(item, 'nt'))
  //   })
  //   discs = discs.concat(ntDiscs.slice(0, 15))
  //   console.log(1,discs)
  // })
  //
  //
  // qqGetDisc().then(res => {
  //   let qqDiscs = []
  //   if (res.code === ERR_OK) {
  //     res.data.list.forEach(item => {
  //       qqDiscs.push(formalizeDisc(item,'qq'))
  //     })
  //   }
  //   discs = discs.concat(qqDiscs.slice(0,15))
  // })
  let { code: code1, playlists } = await ntGetDisc()
  let { code: code2, data } = await qqGetDisc()

  let ntDiscs = []; let qqDiscs = []
  if (code1 === 200) {
    playlists.forEach((item) => {
      ntDiscs.push(formalizeDisc(item, 'nt'))
    })
  }
  discs = discs.concat(ntDiscs.slice(0, 15))
  if (code2 === ERR_OK) {
    data.list.forEach(item => {
      qqDiscs.push(formalizeDisc(item, 'qq'))
    })
  }
  discs = shuffle(discs.concat(qqDiscs.slice(0, 15)))

  return discs
}

export async function getSongList (ntId, qqId) {
  ntId = parseInt(ntId)
  qqId = parseInt(qqId)
  let discInfo = {
    title: '',
    desc: '',
    playNum: 0,
    list: [],
    image: ''
  }; let data

  if (qqId !== -1) {
    data = await qqGetSongList(qqId)
    if (data.code === 0) {
      data.cdlist[0].songlist.forEach(item => {
        let song = {
          name: item.name,
          image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.album.mid}.jpg?max_age=2592000`,
          qqId: item.id,
          qqMid: item.mid,
          album: item.album.name,
          singer: item.singer.map(item => item.name),
          duration: item.interval,
          type: 'qq'
        }
        discInfo.list.push(Object.assign({}, song, {
          ntId: 0
        }))
      })
      discInfo.playNum = data.cdlist[0].visitnum
      discInfo.title = data.cdlist[0].dissname
      discInfo.desc = data.cdlist[0].desc
      discInfo.image = data.cdlist[0].logo
    }
  } else if (ntId !== -1) {
    data = await ntGetSongList(ntId)
    if (data.code === 200) {
      data.playlist.tracks.forEach(item => {
        let song = formalizeSong(item, 'nt')
        discInfo.list.push(Object.assign({}, song, {
          qqId: 0,
          qqMid: 0
        }))
      })
      discInfo.title = data.playlist.name
      discInfo.playNum = data.playlist.playCount
      discInfo.desc = data.playlist.description
      discInfo.image = data.playlist.coverImgUrl
    }
  }
  return discInfo
}
