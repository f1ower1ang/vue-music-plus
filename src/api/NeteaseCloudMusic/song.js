import axios from 'axios'

export async function ntGetLyric (ntId) {
  const url = 'http://encounter-music.cn:8080/lyric'
  let { data } = await axios.get(url, {
    params: {
      id: ntId
    }
  })

  let lyric = data.lrc ? data.lrc.lyric : ''
  return Promise.resolve(lyric)
}

export async function ntGetSongUrl (id) {
  // const url = 'http://encounter-music.cn:8080/check/music'
  const mUrl = 'http://encounter-music.cn:8080/song/url'
  // let {data} = await axios.get(url, {
  //   params: {
  //     id
  //   }
  // })

  // if (data.success) {
  return axios.get(mUrl, {
    params: {
      id
    }
  }).then(res => {
    return Promise.resolve(res.data.data[0].url)
  })
  // } else
  //   return false
}

export async function ntSongDetail (id) {
  const url = 'http://encounter-music.cn:8080/song/detail'
  return axios.get(url, {
    params: {
      ids: id
    }
  }).then(res => {
    res = res.data
    let song = {}
    if (res.songs && res.songs.length > 0) {
      song = {
        qqId: 0,
        qqMid: 0,
        ntId: id,
        image: res.songs[0].al.picUrl,
        singer: res.songs[0].ar.map(item => item.name),
        album: res.songs[0].al.name,
        name: res.songs[0].name,
        duration: Math.floor(res.songs[0].dt / 1000),
        url: `http://encounter-music.cn:81/api/ntUrl?id=${id}`
      }
    }
    return song
  })
}
