export function addClass (el, className) { // 给元素添加类名
  if (hasClass(el, className)) { return }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass (el, className) { // 判断当前元素是否包含某类名
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function getData (el, name, val) { // 获取元素自定义属性值
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else { return el.getAttribute(name) }
}

let elementStyle = document.createElement('div').style

function vendor () {
  let transfroms = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'standard'
  }
  for (let key in transfroms) {
    if (elementStyle[transfroms[key]] !== undefined) { return key }
  }
  return false
}

export function prefixStyle (style) { // 更加浏览器兼容性添加属性名前缀
  if (!vendor()) { return false }
  if (vendor() === 'standard') { return style }
  return vendor() + style.charAt(0).toUpperCase() + style.substr(1)
}
