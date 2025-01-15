const { EventEmitter } = require('events')

module.exports = class Listener extends EventEmitter {
  constructor (cryptix, startHash, confirmations) {
    super()

    this.cryptix = cryptix
    this.currentHash = startHash
    this.confirmationCount = confirmations
    this.currentDAA = 0

    this._listen()
    process.nextTick(() => this.emit('ready'))
  }

  _listen () {
    const pollBlocks = async () => {
      const blueScore = BigInt((await this.cryptix.client.request('getVirtualSelectedParentBlueScoreRequest')).blueScore)

      const addedChainBlocks = (await this.cryptix.client.request('getVirtualSelectedParentChainFromBlockRequest', {
        startHash: this.currentHash
      })).addedChainBlockHashes

      for (const blockHash of addedChainBlocks) {
        const block = (await this.cryptix.client.request('getBlockRequest', { hash: blockHash, includeTransactions: true })).block
        const blockScore = BigInt(block.verboseData.blueScore)

        if (blockScore + this.confirmationCount <= blueScore) {
          this.emit('confirmedBlock', block)

          this.currentHash = block.verboseData.hash
          this.currentDAA = BigInt(block.header.daaScore)
        }
      }

      this.emit('updateCheckpoint', this.currentHash)

      pollBlocks()
    }

    pollBlocks()
  }
}
