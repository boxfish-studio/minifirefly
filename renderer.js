console.log("welcome to minifirefly!")

const preload = window["__MINIFIREFLY__"];

window["api"] = {}

const handle = window["api"]

// ---

const removeWallet = () => {
  preload.removeWallet()
  window["_wallet"] = null
  console.log("👋 REMOVED wallet")
}
handle["removeWallet"] = removeWallet

// ---

const createWallet = () => {
  preload.createWallet().then((wallet) => {
    window["_wallet"] = wallet
    console.log("🆕 CREATED wallet: ", wallet)
  })
}
handle["createWallet"] = createWallet

// ---

const loadWallet = () => {
  preload.loadWallet().then((wallet) => {
    window["_wallet"] = wallet
    console.log("🔄 LOADED wallet: ", wallet)
  })
}
handle["loadWallet"] = loadWallet


// ---

const implicitAccountCreationAddress = () => {
  window["_wallet"].implicitAccountCreationAddress().then((address) => {
    console.log("💸 SEND funds to ", address);
    window["address"] = address
  })
}
handle["implicitAccountCreationAddress"] = implicitAccountCreationAddress

// ---

const sync = () => {
  window["_wallet"].sync({ syncImplicitAccounts: true }).then(async () => {
    console.log("📡 SYNCHED wallet", (await window["_wallet"].getBalance()).baseCoin)
  })
}
handle["sync"] = sync

// ---

const implicitAccounts = () => {
  window["_wallet"].implicitAccounts().then((implicitAccounts) => {
    window["_implicitAccounts"] = implicitAccounts
    console.log("✅ implicitAccounts", implicitAccounts)
  })
}
handle["implicitAccounts"] = implicitAccounts

// ---

const prepareImplicitAccountTransition = () => {
  window["_wallet"].prepareImplicitAccountTransition(window["_implicitAccounts"][0].outputId).then((res) => {
    console.log("✅✅ prepareImplicitAccountTransition", res)
  })
}
handle["prepareImplicitAccountTransition"] = prepareImplicitAccountTransition

setTimeout(async () => {
  console.clear()

  console.log(`
    Use the 'api' object with these methods:
    
    1. createWallet / loadWallet / removeWallet
    2. implicitAccountCreationAddress
    3. sync
    4. implicitAccounts
    5. prepareImplicitAccountTransition
  `)
}, 100)