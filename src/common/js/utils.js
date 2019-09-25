function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) { // 打乱数组中元素顺序
  let _arr = arr.slice()

  for (let i = 0; i < arr.length; i++) {
    let j = random(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
