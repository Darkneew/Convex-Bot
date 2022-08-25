const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const cryptoUtils = require("../../utils/crypto");

module.exports.args = [];
module.exports.description = "Returns a random key pair";
module.exports.xp = 1;
module.exports.details = "Returns a random private key and its associated public key. A key pair can be used to create a new Convex account.";
module.exports.action = async (eventObject, args, dbUtils) => {
    let privateKey = cryptoUtils.randomPrivateKey();
    let publicKey = await cryptoUtils.getPublicKey(privateKey);
    eventObject.reply({
        embeds: [
        new EmbedBuilder()
            .setTitle("Key pair")
            .setColor(config.colors.convex)
            .addFields([{"name":"private key", "value": privateKey},
                {"name":"public key", "value": publicKey}])
            .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
        ],
        ephemeral: true
    });
};

module.exports.buttons = {};
module.exports.modals = {};
