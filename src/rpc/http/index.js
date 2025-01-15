const http = require('http')
const fs = require('fs')
const { EventEmitter } = require('events')

const { Response, ErrorResponse } = require('./responses')

module.exports = class Server extends EventEmitter {
  constructor (port, gateway, readyCallback) {
    super()

    this.gateway = gateway // TODO: Move to better place?
    this.endpoints = new Map()

    for (const file of fs.readdirSync('./src/rpc/http/endpoints').filter(file => file.endsWith('.js'))) {
      const endpoint = require(`./endpoints/${file}`)
      this.endpoints.set(file.replace('.js', ''), endpoint)
    }

    this.server = http.createServer((req, res) => this._handleRequest(req, res))
    this.server.listen(port, () => {
      readyCallback()
    })
  }

  async _handleRequest (req, res) {
    const parsedUrl = new URL(`https://payments.cryptix.org${req.url}`)

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      version: 'v1.0'
    })

    const usedEndpoint = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1]

    if (!this.endpoints.has(usedEndpoint)) return res.end('Endpoint not found.')

    const params = Object.fromEntries(parsedUrl.searchParams)

    try {
      const response = await this.endpoints.get(usedEndpoint).run({
        params: params,
        gateway: this.gateway
      })

      res.end(JSON.stringify(new Response(response).toJSON(), null, 2))
    } catch (err) {
      res.end(JSON.stringify(new ErrorResponse(err.message).toJSON(), null, 2))
    }
  }
}
