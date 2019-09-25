import axios from 'axios'
import jsonp from '../../common/js/jsonp'
import { commonParams, options } from './config'

export function qqGetRank () {
  let url = 'http://encounter-music.cn:81/api/rankList'
  return axios.get(url).then(res => {
    return Promise.resolve(res.data)
  })
}

export function qqGetMusicList (qqId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    topid: qqId,
    needNewCode: 1,
    uin: 0,
    tpl: 3,
    page: 'detail',
    type: 'top',
    platform: 'h5'
  })

  return jsonp(url, data, options)
}
