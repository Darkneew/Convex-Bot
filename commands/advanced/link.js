const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports.args = [];
module.exports.description = "Returns a link to Convex's website";
module.exports.xp = 10;
module.exports.details = "Returns a link to Convex's website."
module.exports.action = (interaction, args, dbUtils) => {
    interaction.reply({embeds:[
        new EmbedBuilder()
        .setTitle("Click here for Convex")
        .setURL("https://convex.world")
        .setColor(config.colors.convex)
        .setFooter({text:"Convex", iconURL: config.links.logo })
    ]});
}