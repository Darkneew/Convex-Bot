const {
    EmbedBuilder
  } = require("discord.js");
  const config = require("../../config.json");
  
  module.exports.args = [];
  module.exports.description = "Shutdown the bot";
  module.exports.xp = 1;
  module.exports.adminCommand = true;
  module.exports.details = "Shutdown the bot";
  module.exports.action = (eventObject, args, dbUtils) => {
    eventObject.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.success))
            .setFooter({ text: "Convex", iconURL: config.links.ressources.logo })
            .setTitle("Shutting down the bot"),
        ]
      }).then(() => {
        process.exit();
      })
  };
  
  module.exports.buttons = {};
  module.exports.modals = {};
  module.exports.callbacks = {};
  