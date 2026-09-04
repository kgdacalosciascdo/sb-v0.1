const demoAuthKey = 'simplebiz.one.demo-authenticated'

function getStorage(kind: 'local' | 'session') {
  return kind === 'local' ? window.localStorage : window.sessionStorage
}

export function isDemoAuthenticated() {
  try {
    return (
      getStorage('local').getItem(demoAuthKey) === 'true' ||
      getStorage('session').getItem(demoAuthKey) === 'true'
    )
  } catch {
    return false
  }
}

export function setDemoAuthenticated(rememberMe: boolean) {
  try {
    getStorage('local').removeItem(demoAuthKey)
    getStorage('session').removeItem(demoAuthKey)
    getStorage(rememberMe ? 'local' : 'session').setItem(demoAuthKey, 'true')
  } catch {
    // Browser storage can be unavailable in restricted preview environments.
  }
}

export function clearDemoAuthenticated() {
  try {
    getStorage('local').removeItem(demoAuthKey)
    getStorage('session').removeItem(demoAuthKey)
  } catch {
    // Browser storage can be unavailable in restricted preview environments.
  }
}
