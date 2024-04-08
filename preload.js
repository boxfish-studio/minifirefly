require('reflect-metadata');
const { ipcRenderer, contextBridge } = require('electron')
const { SecretManager, Wallet, Utils } = require('@iota/sdk');
const IotaSdk = require('@iota/sdk')
const fs = require('node:fs');

function bindMethodsAcrossContextBridge(prototype, object) {
  const prototypeProperties = Object.getOwnPropertyNames(prototype)
  prototypeProperties.forEach((key) => {
      if (key !== 'constructor') {
          object[key] = object[key].bind(object)
      }
  })
}

const node = process.env["MINIFIREFLY_NODE"]

// IOTA
const WALLET_DB_PATH = 'MINIFIREFLY-DB';
const NODE_URL = node
const STRONGHOLD_PASSWORD = 'firefly';
const STRONGHOLD_SNAPSHOT_PATH = 'MINIFIREFLY-DB/minifirefly.stronghold';
const strongholdSecretManager = {
  stronghold: {
    snapshotPath: STRONGHOLD_SNAPSHOT_PATH,
    password: STRONGHOLD_PASSWORD,
  },
};



try {
    ipcRenderer.invoke('get-path', 'userData').then(async (baseDir) => {
        const logDir = `${baseDir}/logs`
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir)
        }
        const versionDetails = await ipcRenderer.invoke('get-version-details')
        const today = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-')
        const loggerOptions = {
            colorEnabled: true,
            name: `${logDir}/minifirefly-v${versionDetails.currentVersion}-d${today}.log`,
            levelFilter: 'debug',
            targetExclusions: ['h2', 'hyper', 'rustls', 'message_handler'],
        }
        IotaSdk.initLogger(loggerOptions)

    })
} catch (err) {
  console.error('[Preload Context] Error:', err)
}

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
      secretManager: null,
    };

    const wallet = await Wallet.create(walletOptions);
    bindMethodsAcrossContextBridge(Wallet.prototype, wallet)
    await wallet.sync({
      forceSyncing: true,
      account: {
          basicOutputs: true,
          aliasOutputs: true,
      },
      wallet: {
          basicOutputs: false,
          accountOutputs: false,
      },
      syncIncomingTransactions: true,
      syncNativeTokenFoundries: true,
      syncImplicitAccounts: true,
    })
    return wallet
  },
  removeWallet() {
    fs.rmSync(WALLET_DB_PATH, {
      recursive: true,
      force: true
    })
  }
})
