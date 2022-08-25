const {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const config = require("../../config.json");

module.exports.args = [
  {
    name: "tag",
    type: "String",
    description: "The type of issue you are having",
    details:
      "The tag correspond to the type of issue you are having. This parameter allows moderators to do a first quick sort of the tickets. Please thus select the most appropriate tag for your issue.",
    required: true,
    choices: (() => {
      let choices = [];
      config.ticketTags.forEach((v) => {
        choices.push({ name: v, value: v });
      });
      return choices;
    })(),
  },
];
module.exports.description =
  "Create a ticket. Please do not abuse of this command.";
module.exports.details =
  "Allows you to create a ticket (report an issue, and follow its progress). Please do not abuse of this command, as tickets are all manually processed by moderators.";
module.exports.xp = 100;
module.exports.onlyInteraction = true;
module.exports.action = (eventObject, args, dbUtils) => {
  let modal = new ModalBuilder()
    .setCustomId(`ticketcreation|${args["tag"]}`)
    .setTitle("Ticket Creation");
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
  ticketcreation: (interaction, dbUtils, args) => {
    dbUtils.createTicket.run(
      args[0],
      interaction.fields.getTextInputValue("title"),
      interaction.fields.getTextInputValue("description"),
      interaction.user.id,
      new Date().getTime()
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Success")
          .setColor(config.colors.success)
          .setDescription(
            `A new ticket named _${interaction.fields.getTextInputValue(
              "title"
            )}_ was successfully created.`
          )
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ],
    });
  },
};
