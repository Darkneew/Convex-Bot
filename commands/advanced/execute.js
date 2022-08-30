const {
  ModalBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const config = require("../../config.json");
const queryUtils = require("../../utils/query");
const convexUtils = require("../../utils/convex");

module.exports.args = [
  {
    name: "mode",
    type: "String",
    description: "The mode to execute code",
    details: "Choose the mode you want to be in when executing the code",
    required: true,
    choices: [
      { name: "query", value: "query" },
      { name: "transaction", value: "transaction" },
    ],
  },
  {
    name: "address",
    type: "Integer",
    description: "the address you want to execute code as",
    required: false,
    details:
      "If this argument is given, the code given will be executed from this address. Option only available when in query mode.",
  },
];
module.exports.onlyInteraction = true;
module.exports.description =
  "Execute any code on the CVM, in transaction or query mode";
module.exports.xp = 10;
module.exports.details =
  "This command will send any string you give to the CVM, and return the value returned. You can choose between Query and Transaction mode";
module.exports.action = (eventObject, args, dbUtils) => {
  if (args["mode"] == "transaction" && Object.keys(args).includes("address")) {
    eventObject.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo })
          .setTitle("Error")
          .setDescription(`Cannot specify an address in transaction mode`),
      ],
    });
    return;
  }
  let user = eventObject.user || eventObject.author;
  let address =
    args["address"] ||
    queryUtils.getAddress(dbUtils, user.id, user.username, eventObject, true);
  if (address == -1) return;
  let modal = new ModalBuilder()
    .setCustomId(`execute|${args["mode"]}|${address}`)
    .setTitle(`Execute a ${args["mode"]}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("source")
        .setLabel("Code to execute")
        .setStyle(TextInputStyle.Paragraph)
    )
  );
  eventObject.showModal(modal);
};

module.exports.buttons = {};
module.exports.modals = {
  execute: (interaction, dbUtils, args) => {
    if (args[0] == "transaction") {
      convexUtils.makeTransaction(
        dbUtils,
        interaction,
        interaction.user.id,
        interaction.fields.getTextInputValue("source"),
        "Execution",
        true
      );
    } else {
      convexUtils.query(
        interaction,
        args[1],
        interaction.fields.getTextInputValue("source"),
        "Execution",
        true
      );
    }
  },
};
module.exports.callbacks = {};
