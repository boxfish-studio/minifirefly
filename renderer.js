console.log("welcome to minifirefly!")

const API = window["__MINIFIREFLY__"];
console.log("api -> ", API)

// ---

const createWallet = () => {
  API.createWallet().then((wallet) => {
    window["_wallet"] = wallet
    console.log("created wallet: ", wallet)
  })
}
window["createWallet"] = createWallet
console.log("createWallet -> ", createWallet)

// ---

const implicitAccountCreationAddress = () => {
  window["_wallet"].implicitAccountCreationAddress().then((address) => {
    console.log("send funds to ", address);
    window["address"] = address
  })
}
window["implicitAccountCreationAddress"] = implicitAccountCreationAddress
console.log("implicitAccountCreationAddress -> ", implicitAccountCreationAddress)

// ---

const sync = () => {
  window["_wallet"].sync({ syncImplicitAccounts: true }).then(() => {
    console.log("synched wallet")
  })
}
window["sync"] = sync
console.log("sync -> ", sync)

// ---

const implicitAccounts = () => {
  window["_wallet"].implicitAccounts().then((implicitAccounts) => {
    window["_implicitAccounts"] = implicitAccounts
    console.log("implicitAccounts", implicitAccounts)
  })
}
window["implicitAccounts"] = implicitAccounts
console.log("implicitAccounts -> ", implicitAccounts)

// ---

const prepareImplicitAccountTransition = () => {
  window["_wallet"].prepareImplicitAccountTransition(window["_implicitAccounts"][0].outputId).then((res) => {
    console.log("res of prepareImplicitAccountTransition", res)
  })
}
window["prepareImplicitAccountTransition"] = prepareImplicitAccountTransition
console.log("prepareImplicitAccountTransition -> ", prepareImplicitAccountTransition)