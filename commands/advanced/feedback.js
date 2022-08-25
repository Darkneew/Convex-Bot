const {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
  } = require("discord.js");
  const config = require("../../config.json");
  
  module.exports.args = [];

  module.exports.description =
    "Give a feedback. Please do not abuse of this command.";
  module.exports.details =
    "Allows you to give a feedback (directly send an issue, comment, report or question on Convex's server). Please do not abuse of this command, as feedbacks are all manually processed by moderators.";
  module.exports.xp = 100;
  module.exports.onlyInteraction = true;
  module.exports.action = (eventObject, args, dbUtils) => {
    let modal = new ModalBuilder()
      .setCustomId("feedback")
      .setTitle("Feedback");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Title")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Description")
          .setStyle(TextInputStyle.Paragraph)
      )
    );
    eventObject.showModal(modal);
  };
  
  module.exports.buttons = {};
  module.exports.modals = {
    feedback: async (interaction, dbUtils, args) => {
        let address = dbUtils.getUserAddress.get(interaction.user.id);
        let text = `(account #${address})`;
        if (address == -1) text = "(no convex account)";
        let guild = await interaction.client.guilds.fetch(config.convexServer);
        let channel = await guild.channels.fetch(config.feedbackChannel);
        channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(interaction.fields.getTextInputValue(
                    "title"
                  ))
                .setColor(config.colors.convex)
                .setDescription(interaction.fields.getTextInputValue(
                    "description"
                  ))
                .setFooter({ text: `Feedback by ${interaction.user.username} ${text}`, iconURL: config.links.ressources.logo }),
            ],
          });
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.success))
              .setFooter({ text: "Convex", iconURL: config.links.ressources.logo })
              .setTitle("Feedback successfully sent"),
          ]
        })
    }
  };
  