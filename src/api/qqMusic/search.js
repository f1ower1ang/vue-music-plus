import axios from 'axios'
import jsonp from '../../common/js/jsonp'
import { commonParams, options } from './config'

import { formalizeSong } from '../index/singer'

export function qqGetHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    uin: 0,
    format: 'json',
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}

export function qqSearchSongAndSinger (type, keywords, page, limit) {
  const url = 'http://encounter-music.cn:81/api/search'
  return axios.get(url, {
    params: {
      type,
      keywords,
      page,
      pageSize: limit
    }
  }).then(res => {
    let data = res.data
    if (type === 'song') {
      let list = []
      if (data.code === 0) {
        data.data.song.list.forEach(item => {
          list.push(Object.assign({}, {
            name: item.name,
            image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.album.mid}.jpg?max_age=2592000`,
            qqId: item.id,
            qqMid: item.mid,
            album: item.album.name,
            singer: item.singer.map(item => item.name),
            duration: item.interval
          }, {
            ntId: 0,
            url: `http://cc0722.xyz/t/index.php?id=${item.mid}`
          }))
        })
      }
      return Promise.resolve(list)
    } else if (type === 'singer') {
      let singers = []
      if (data.code === 0 && data.data.zhida && data.data.zhida.zhida_singer) {
        let item = data.data.zhida.zhida_singer
        singers.push({
          avator: `https://y.gtimg.cn/music/photo_new/T001R300x300M000${item.singerMID}.jpg?max_age=2592000`,
          imgUrl: `https://y.gtimg.cn/music/photo_new/T001R300x300M000${item.singerMID}.jpg?max_age=2592000`,
          qqId: item.singerID,
          qqMid: item.singerMID,
          singer: item.singerName
        })
      }
      return Promise.resolve(singers)
    }
  })
}
