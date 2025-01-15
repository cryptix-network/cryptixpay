const cryptixjs = require('cryptixjs')
const { EventEmitter } = require('events')

module.exports = class Wallet extends EventEmitter {
  constructor (config, readyCallback) {
    super()

    this.wallet = new cryptixjs.walletDaemon(config.daemonAddress, () => readyCallback())
    this.wallet.password = config.password
  }

  async getAddresses () {
    return await this.wallet.getAddresses()
  }

  async sendPayment (acceptedAddress, recipient, amount) {
    return await this.wallet.sendFrom(acceptedAddress, recipient, amount, this.wallet.password)
  }

  async createAddress () {
    return (await this.wallet.createAddress())
  }
}
