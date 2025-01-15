const config = require('./config.json')

const Gateway = {
  gateway: require('./src/gateway'),
  console: require('modernlog/patch')
}

const Cryptix = {
  client: require('./src/cryptix/client'),
  listener: require('./src/cryptix/listener'),
  wallet: require('./src/cryptix/wallet')
}

const Database = {
  db: require('./src/database'),
  operation: require('./src/database/operation')
}

const RPC = {
  http: require('./src/rpc/http')
}

const cryptix = new Cryptix.client(config.cryptix.nodeAddress, async () => {
  const wallet = new Cryptix.wallet(config.cryptix.wallet, async () => {
    console.log('Opened wallet successfully, starting database service...')

    const database = new Database.db(config.database.path, async () => {
      console.log('Started database service, activating listener...')

      let checkpoint = await database.execute(new Database.operation('get', {
        subDB: 'gateway',
        key: 'checkpoint'
      }))

      if (checkpoint === undefined || await cryptix.getBlock(checkpoint) === null) {
        const dagInfo = await cryptix.getBlockDAGInfo()

        checkpoint = dagInfo.pruningPointHash
      }

      const listener = new Cryptix.listener(cryptix, checkpoint, BigInt(config.cryptix.listener.requiredConfirmations))

      listener.once('ready', async () => {
        listener.on('updateCheckpoint', async (hash) => {
          await database.execute(new Database.operation('set', {
            subDB: 'gateway',
            key: 'checkpoint',
            value: hash
          }))
        })

        console.log('Listener ready, starting gateway...')

        const paymentHandler = new Gateway.gateway({
          database: database,
          cryptix: cryptix,
          wallet: wallet,
          listener: listener
        }, config.payment)

        paymentHandler.once('ready', () => {
          console.log('Gateway is active! starting enabled services...')

          if (config.rpc.http.enabled) {
            new RPC.http(config.rpc.http.port, paymentHandler, () => {
              console.log(`RPC:HTTP service listening on port ${config.rpc.http.port}.`)
            })
          }
        })
      })
    })
  })

  console.log('Connected to node, opening wallet...')
})

console.log('Connecting to Cryptix node...')
