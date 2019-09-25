import {getLyrics} from '../../api/index/song'

export default class Song {
  constructor ({ qqId, qqMid, ntId, image, url, name, album, singer, duration }) {
    this.qqId = qqId
    this.qqMid = qqMid
    this.ntId = ntId
    this.image = image
    this.url = url
    this.name = name
    this.album = album
    this.singer = singer
    this.duration = duration
  }

  async getLyric () {
    if (this.lyric) { return Promise.resolve(this.lyric) }
    this.lyric = await getLyrics(this.qqMid, this.ntId)

    return Promise.resolve(this.lyric)
  }
}

export function createSong (musicData) {
  return new Song({
    qqId: musicData.qqId,
    qqMid: musicData.qqMid,
    ntId: musicData.ntId,
    image: musicData.image,
    name: musicData.name,
    album: musicData.album,
    singer: musicData.singer.join('/'),
    duration: musicData.duration,
    url: musicData.url
  })
}
