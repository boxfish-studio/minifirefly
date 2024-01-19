require('reflect-metadata');
const { contextBridge } = require('electron')
const { SecretManager, Wallet, Utils } = require('@iota/sdk');
const fs = require('node:fs');

function bindMethodsAcrossContextBridge(prototype, object) {
  const prototypeProperties = Object.getOwnPropertyNames(prototype)
  prototypeProperties.forEach((key) => {
      if (key !== 'constructor') {
          object[key] = object[key].bind(object)
      }
  })
}

// IOTA
const WALLET_DB_PATH = 'MINIFIREFLY-DB';
const NODE_URL = process.env["MINIFIREFLY_NODE"]
const STRONGHOLD_PASSWORD = 'firefly';
const STRONGHOLD_SNAPSHOT_PATH = 'MINIFIREFLY-DB/minifirefly.stronghold';
const strongholdSecretManager = {
  stronghold: {
    snapshotPath: STRONGHOLD_SNAPSHOT_PATH,
    password: STRONGHOLD_PASSWORD,
  },
};

contextBridge.exposeInMainWorld('__MINIFIREFLY__', {
  async createWallet() {
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
    bindMethodsAcrossContextBridge(Wallet.prototype, wallet)
    return wallet
  },
  async loadWallet() {
    const walletOptions = {
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
    bindMethodsAcrossContextBridge(Wallet.prototype, wallet)
    return wallet
  },
  removeWallet() {
    fs.rmSync(WALLET_DB_PATH, {
      recursive: true,
      force: true
    })
  }
})
