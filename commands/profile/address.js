const utils = require("../../utils/misc");
const { EmbedBuilder } = require("discord.js");
const convexUtils = require("../../utils/convex");
const config = require("../../config.json");

module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the address of",
        "required": false,
        "details": "If this argument is given, it will allow you to check someone else's address. An argument of type User is expected."
    }
];
module.exports.description = "Check your address";
module.exports.xp = 1;
module.exports.details = "Display your or another user's address. Use `profile account change` to change your address"

const sendaddress = (eventObject, address, pronoun) => {
    eventObject.reply({
        embeds: [
            new EmbedBuilder()
            .setColor(config.colors.convex)
            .setFooter({ text: "Convex", iconURL: config.links.logo })
            .setTitle(`${pronoun} address is ${address}`)
        ]
    });
}

module.exports.action = async (eventObject, args, dbUtils) => {
    let author = eventObject.author || eventObject.user;
    if (Object.keys(args).includes("user")) {
        eventObject.guild.members.fetch(args["user"]).then(async (member) => {
            let address = utils.getAddress(dbUtils, member.user, eventObject, member.id == author.id);
            if (address == -1) return;
            if (member.id == author.id) sendaddress(eventObject, address, "Your");
            else sendaddress(eventObject, address, member.user.username + "'s");
        });
    } else {
        let address = utils.getAddress(dbUtils, author, eventObject, true);
        if (address == -1) return;
        sendaddress(eventObject, address, "Your");
    }
}

module.exports.buttons = {};
module.exports.modals = {};