const config = require("../config.json");
const cryptoUtils = require("./crypto");
const ed25519 = require("@noble/ed25519");
const axios = require("axios").create({baseURL: config.convexUrl});

module.exports.createAccount = async (privateKey = null) => {
    if (!privateKey) privateKey = ed25519.utils.bytesToHex(ed25519.utils.randomPrivateKey());
    let res = await axios.post('createAccount', {"accountKey": ed25519.utils.bytesToHex(await ed25519.getPublicKey(cryptoUtils.hexToBytes(privateKey)))});
    return {"address": res.data.address, "privateKey": privateKey};
}