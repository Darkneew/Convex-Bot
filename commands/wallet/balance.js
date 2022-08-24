const utils = require("../../utils/misc");
const { EmbedBuilder } = require("discord.js");
const convexUtils = require("../../utils/convex");
const config = require("../../config.json");

module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the balance of",
        "required": false,
        "details": "If this argument is given, it will allow you to check someone else's balance. An argument of type User is expected."
    }
];
module.exports.description = "Check your balance of Convex coins";
module.exports.xp = 1;
module.exports.details = "Gives your or another user's balance of Convex coins. Use wallet buy-coins to buy more Convex coins with outer currencies."

const sendBalance = (eventObject, balance, pronoun) => {
    let embed = new EmbedBuilder()
    .setColor(config.colors.convex)
    .setFooter({ text: "Convex", iconURL: config.links.logo });
    if (pronoun == "You") 
        embed.setTitle(`${pronoun} have a balance of ${balance} coins`);
    else 
        embed.setTitle(`${pronoun} has a balance of ${balance} coins`);
    eventObject.reply({
        embeds: [ embed ]
    });
}

module.exports.action = async (eventObject, args, dbUtils) => {
    let author = eventObject.author || eventObject.user;
    if (Object.keys(args).includes("user")) {
        eventObject.guild.members.fetch(args["user"]).then(async (member) => {
            let address = utils.getAddress(dbUtils, member.user, eventObject, member.id == author.id);
            if (address == -1) return;
            let account = await convexUtils.getAccountDetails(address);
            let balance = account.balance;
            if (member.id == author.id) sendBalance(eventObject, balance, "You");
            else sendBalance(eventObject, balance, member.user.username);
        });
    } else {
        let address = utils.getAddress(dbUtils, author, eventObject, true);
        if (address == -1) return;
        let account = await convexUtils.getAccountDetails(address);
        let balance = account.balance;
        sendBalance(eventObject, balance, "You");
    }
}

module.exports.buttons = {};
module.exports.modals = {};