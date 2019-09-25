import axios from 'axios'
import { commonParams } from './config'

export function qqGetSongUrl (qqMid) {
  // let filename = `C400${qqMid}.m4a`
  const url = 'http://encounter-music.cn:81/api/getSongUrl'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq.json',
    needNewCode: 0,
    format: 'json',
    data: {
      'req_0': {
        'module': 'vkey.GetVkeyServer',
        'method': 'CgiGetVkey',
        'param': {
          'guid': '46072864',
          'songmid': [qqMid],
          'songtype': [0],
          'uin': '0',
          'loginflag': 0,
          'platform': '20'
        }
      },
      'comm': { 'uin': 0, 'format': 'json', 'ct': 24, 'cv': 0 }
    }
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    let midur = res.data.req_0.data.midurlinfo[0]
    let url = `http://117.169.70.20/amobile.music.tc.qq.com/${midur.purl}`
    return Promise.resolve(url)
  })
}

export function qqGetLyrics (id) {
  const url = 'http://encounter-music.cn:81/api/lyric'
  return axios.get(url, {
    params: {
      id
    }
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
