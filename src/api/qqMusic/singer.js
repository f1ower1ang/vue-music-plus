import axios from 'axios'
import { commonParams, options } from './config'
import jsonp from '../../common/js/jsonp'

export function qqGetSingerList () {
  const url = 'http://encounter-music.cn:81/api/singerList'
  return axios.get(url).then(res => {
    return Promise.resolve(res.data)
  })
}

export function qqGetSingerDetail (singermid, singerid) {
  if (!singermid || !singerid) {
    return {
      code: -1
    }
  }
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'

  const data = Object.assign({}, commonParams, {
    needNewCode: 0,
    order: 'listen',
    platform: 'h5page',
    begin: 0,
    num: 100,
    songstatus: 1,
    singerid: singerid,
    singermid: singermid
  })
  return jsonp(url, data, options)
}
