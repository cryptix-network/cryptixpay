# Cryptixpay 💵
### Payment gateway for Cryptix!

## Features
* Light, uses about 20 MB ram(nearly no CPU usage!) on a typical computer.
* Supports infinite payments per instance in theory.
* Extendable, modular design.
* Supports multiple networks(Testnet, mainnet...).
* Built with modern RPC api.

## Usage
Install NodeJS from [here](https://nodejs.org/) and install modules by ``npm install`` and just run using ``node index.js`` after configuration or just use a prehosted instance.

## Endpoints

getStats
Returns telemetry from gateway.

GET https://cryptix-network.org/api/getStats

----

getPayment
Returns details of payments using payment id.

GET https://cryptix-network.org/api/getPayment

Query Parameters
Name: paymentId*
Type: String
Description: Identifier of payment.

---

createPayment
Creates a new payment and returns payment id of it.

GET https://cryptix-network.org/api/createPayment

Query Parameters
Name: amount* |  merchant
Type: String |String
Description: Amount of payment | Merchant address.




### Kudos
kaffinpx
