export class Storage {
  constructor() {

  }

  static removeStorage(key: string) {
    localStorage.removeItem(key)
  }

  static getStorage(key: string) {
    return localStorage.getItem(key)
  }

  static setStorage(key: string, value: string) {
    localStorage.setItem(key, value)
  }

  static clear() {
    localStorage.clear()
  }
}
