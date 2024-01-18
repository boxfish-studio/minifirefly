require('reflect-metadata');
const { contextBridge } = require('electron')
const SDK = require('@iota/sdk');

console.log(SDK)

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (typeof value === 'function') {
      // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function (...args) {
        return value.call(obj, ...args)
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}

// IOTA
const WALLET_DB_PATH = 'MINIFIREFLY-DB';
const NODE_URL = console.error("ADD A NODE!")
const STRONGHOLD_PASSWORD = 'firefly';
const STRONGHOLD_SNAPSHOT_PATH = 'minifirefly.stronghold';

contextBridge.exposeInMainWorld('__MINIFIREFLY__', {
  async createWallet() {
    const strongholdSecretManager = {
      stronghold: {
        snapshotPath: STRONGHOLD_SNAPSHOT_PATH,
        password: STRONGHOLD_PASSWORD,
      },
    };

    const secretManager = SecretManager.create(strongholdSecretManager);
    const mnemonic = Utils.generateMnemonic();
    await secretManager.storeMnemonic(mnemonic);
    const wallet_address = await secretManager.generateEd25519Addresses({
      coinType: 1,
      accountIndex: 0,
      range: {
        start: 0,
        end: 1,
      },
      bech32Hrp: 'tst',
    });

    const walletOptions = {
      address: wallet_address[0],
      storagePath: WALLET_DB_PATH,
      clientOptions: {
        nodes: [NODE_URL],
      },
      bipPath: {
        coinType: 1,
      },
      secretManager: strongholdSecretManager,
    };

    const wallet = await Wallet.create(walletOptions);

    console.log('Generated wallet with address: ' + (await wallet.address()));

    return withPrototype(wallet)
  }
})
