const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
  } = require("discord.js");
  const config = require("../../config.json");
  
  module.exports.args = [];
  module.exports.description = "Returns an invite to Convex's discord server";
  module.exports.xp = 30;
  module.exports.details = "Returns an invite to Convex's discord server.";
  module.exports.action = (eventObject, args, dbUtils) => {
    eventObject.reply({
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setURL("https://discord.gg/cQdN9u3HRk")
            .setLabel("Join Convex's server")
            .setStyle(ButtonStyle.Link)
        )
      ],
      embeds: [
        new EmbedBuilder()
          .setTitle("Invite to Convex's discord server")
          .setColor(config.colors.convex)
          .setDescription("https://discord.gg/cQdN9u3HRk")
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ]
    });
  };
  
  module.exports.buttons = {};
  module.exports.modals = {};
  module.exports.callbacks = {};
  