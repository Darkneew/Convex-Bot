const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");

module.exports.args = [];
module.exports.description = "Let you add this bot on your server";
module.exports.xp = 30;
module.exports.details =
  "Returns an invite that allow you to add this bot to servers where you are admin";
module.exports.action = (eventObject, args, dbUtils) => {
  eventObject.reply({
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(
            "https://discord.com/api/oauth2/authorize?client_id=1004552872811302952&permissions=8&scope=bot%20applications.commands"
          )
          .setLabel("Invite the bot")
          .setStyle(ButtonStyle.Link)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("Invite the bot to your server")
        .setColor(config.colors.convex)
        .setDescription(
          "https://discord.com/api/oauth2/authorize?client_id=1004552872811302952&permissions=8&scope=bot%20applications.commands"
        )
        .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
    ],
  });
};

module.exports.buttons = {};
module.exports.modals = {};
