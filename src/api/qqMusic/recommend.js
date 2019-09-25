import jsonp from '../../common/js/jsonp'
import axios from 'axios'
import { commonParams, options } from './config'

export function qqGetRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParams, {
    needNewCode: 1,
    uin: 0,
    platform: 'h5'
  })
  return jsonp(url, data, options)
}

export function qqGetDisc () {
  const url = 'http://encounter-music.cn:81/api/discList'
  return axios.get(url, {
    params: {
      categoryId: 10000000
    }
  }).then(res => Promise.resolve(res.data))
}

export function qqGetSongList (id) {
  const url = 'http://encounter-music.cn:81/api/discSong'
  return axios.get(url, {
    params: {
      id
    }
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
