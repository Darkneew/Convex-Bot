const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports.args = [];
module.exports.description = "Returns a link to Convex's website";
module.exports.xp = 10;
module.exports.details = "Returns a link to Convex's website.";
module.exports.action = (eventObject, args, dbUtils) => {
  eventObject.reply({
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL("https://convex.world")
          .setLabel("Convex")
          .setStyle(ButtonStyle.Link)
      )
    ]
  });
};

module.exports.buttons = {};
module.exports.modals = {};
