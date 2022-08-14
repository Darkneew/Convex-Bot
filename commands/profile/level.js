const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the level of",
        "required": false,
        "details": "If this argument is given, it will allow you to check someone else's level. An argument of type User is expected."
    }
];
module.exports.description = "Check your level";
module.exports.xp = 1;
module.exports.details = "Gives your or another user's level. Use this bot to increase your level.";

const reply = (user, interaction, dbUtils, pronoun) => {
    let xp = dbUtils.getXP(user.id);
    let level = 0;
    if (xp > 1) level = Math.floor(Math.log2(xp));
    interaction.reply({embeds:[
        new EmbedBuilder()
        .setTitle(`${pronoun} level is ${level}`)
        .setColor(config.colors.convex)
        .setDescription(`with a total of ${xp} xp`)
        .setThumbnail(user.avatarURL())
        .setFooter({text:"Convex", iconURL: config.links.logo })
    ]});
}

module.exports.action = (interaction, args, dbUtils) => {
    if (Object.keys(args).includes("user")) 
        interaction.guild.members.fetch(args.user).then((member) => {
            reply(member.user, interaction, dbUtils, member.user.username);
        });
    else {
        reply(interaction.author || interaction.user, interaction, dbUtils, "Your");
    };
};