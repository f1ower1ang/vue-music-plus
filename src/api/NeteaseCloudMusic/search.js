import axios from 'axios'
import { ntSongDetail } from './song'

export function ntGetHotKey () {
  const url = 'http://encounter-music.cn:8080/search/hot'

  return axios.get(url).then(res => {
    return Promise.resolve(res.data)
  })
}

export async function ntSearchSong (keywords, page, limit) {
  const url = 'http://encounter-music.cn:8080/search'
  let list = []
  return axios.get(url, {
    params: {
      keywords,
      limit,
      offset: page - 1,
      type: 1
    }
  }).then(async res => {
    let data = res.data
    if (data.result.songs && data.result.songs.length > 0) {
      data.result.songs.forEach(item => {
        list.push({
          qqId: 0,
          qqMid: 0,
          ntId: item.id,
          image: `http://encounter-music.cn:81/api/ntImg?id=${item.id}`,
          singer: item.artists.map(item => item.name),
          album: item.album.name,
          name: item.name,
          duration: Math.floor(item.duration / 1000),
          url: `http://encounter-music.cn:81/api/ntUrl?id=${item.id}`
        })
      })
    }
    return Promise.resolve(list)
  })

  // const url = 'https://v1.itooi.cn/netease/search'
  // return axios.get(url, {
  //   params: {
  //     keyword: keywords,
  //     page: page - 1,
  //     pageSize: limit,
  //     type: 'song'
  //   }
  // }).then(res => {
  //   let list = []
  //   let data = res.data
  //   if (data.code === 200) {
  //     if(data.data)
  //       list = data.data.songs.map(item => {
  //         return {
  //           name: item.name,
  //           image: item.al.picUrl,
  //           ntId: item.id,
  //           singer: item.ar.map(sg => {
  //             return sg.name
  //           }),
  //           type: 'nt',
  //           album: item.al.name,
  //           duration: Math.floor(item.dt / 1000),
  //           url: `http://encounter-music.cn/api/ntUrl?id=${item.id}`
  //         }
  //       })
  //   }
  //   return Promise.resolve(list)
  // })
}

export function ntSearchSinger (keywords, page, limit) {
  const url = 'http://encounter-music.cn:8080/search'

  return axios.get(url, {
    params: {
      keywords,
      offset: page - 1,
      limit,
      type: 100
    }
  }).then(res => {
    res = res.data
    let singers = []
    if (res.code === 200) {
      res.result.artists.forEach(item => {
        singers.push({
          avator: item.img1v1Url,
          imgUrl: item.picUrl || item.img1v1Url,
          ntId: item.id,
          singer: item.name
        })
      })
    }
    return Promise.resolve(singers)
  })
}

export function ntSearchDisc (keywords, page, limit) {
  const url = 'http://encounter-music.cn:8080/search'
  return axios.get(url, {
    params: {
      keywords,
      offset: page - 1,
      limit,
      type: 1000
    }
  }).then(res => {
    res = res.data
    let info = {
      count: 0,
      list: []
    }
    if (res.code === 200) {
      info.count = res.result.playlistCount
      res.result.playlists.forEach(item => {
        info.list.push({
          type: 'nt',
          discName: item.name,
          playNum: item.playCount.toString().length > 5 ? (item.playCount / 10000).toFixed(1) + '万' : item.playCount,
          discId: item.id,
          imgUrl: item.coverImgUrl,
          count: item.trackCount
        })
      })
    }
    return Promise.resolve(info)
  })
}
