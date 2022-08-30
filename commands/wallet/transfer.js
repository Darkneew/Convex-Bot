const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const queryUtils = require("../../utils/query");
const argUtils = require("../../utils/arg");
const convexUtils = require("../../utils/convex");

module.exports.args = [
  {
    name: "user",
    type: "User",
    description: "the user you want to transfer money to",
    required: false,
    details:
      "If this argument is given, it will allow you choose the receiver using a mention and not an address. An argument of type User is expected.",
  },
];

module.exports.description = "Transfer money to another account";
module.exports.details =
  "Transfer Convex coins to another account. You can precise the user you want to transfer coins to as an argument.";
module.exports.xp = 20;
module.exports.onlyInteraction = true;
module.exports.action = (eventObject, args, dbUtils) => {
  let modal = new ModalBuilder().setTitle("Transfer details");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("amount")
        .setLabel("Amount")
        .setStyle(TextInputStyle.Short)
    )
  );
  if (Object.keys(args).includes("user"))
    modal.setCustomId(`transfercoins|${args["user"]}`);
  else {
    modal
    .setCustomId(`transfercoins`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("address")
          .setLabel("Address to transfer to")
          .setStyle(TextInputStyle.Short)
      )
    );
  }
  eventObject.showModal(modal);
};

module.exports.buttons = {};
module.exports.modals = {
  transfercoins: (interaction, dbUtils, args) => {
    if (
      !argUtils.checkInt(
        interaction.fields.getTextInputValue("amount"),
        interaction,
        "Amount"
      )
    )
      return;
    if (args.length > 0) {
      interaction.guild.members.fetch(args[0]).then((member) => {
        let address = queryUtils.getAddress(dbUtils, member.id, member.user.username, interaction);
        convexUtils.makeTransaction(
          dbUtils,
          interaction,
          interaction.user.id,
          `(transfer #${address} ${interaction.fields.getTextInputValue(
            "amount"
          )})`,
          "Transfer"
        );
      });
    } else {
      let address = interaction.fields.getTextInputValue("address");
      if (address.startsWith("#"))
        address = address.split("").splice(1).join("");
      if (!argUtils.checkInt(address, interaction, "Address")) return;
      convexUtils.makeTransaction(
        dbUtils,
        interaction,
        interaction.user.id,
        `(transfer #${address} ${interaction.fields.getTextInputValue(
          "amount"
        )})`,
        "Transfer"
      );
    }
  },
};

module.exports.callbacks = {};