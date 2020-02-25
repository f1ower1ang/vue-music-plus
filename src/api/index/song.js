import { qqGetLyrics } from '../qqMusic/song'
import { ntGetLyric } from '../NeteaseCloudMusic/song'

export async function getLyrics (qqMid, ntId) {
  if (qqMid !== 0) {
    return qqGetLyrics(qqMid)
  } else {
    return ntGetLyric(ntId)
  }
}

export async function getSongUrl (qqMid, ntId) {
  if (qqMid !== 0) {
    let url = `https://v1.itooi.cn/tencent/url?id=${qqMid}`
    return Promise.resolve(url)
  } else if (ntId !== 0) {
    let url = `http://encounter-music.cn:81/api/ntUrl?id=${ntId}`
    return Promise.resolve(url)
  }
}
