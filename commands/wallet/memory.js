const utils = require("../../utils/misc");
const argUtils = require("../../utils/arg");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const convexUtils = require("../../utils/convex");
const config = require("../../config.json");

module.exports.args = [
  {
    name: "user",
    type: "User",
    description: "the user you want to check the memory of",
    required: false,
    details:
      "If this argument is given, it will allow you to check someone else's memory size and memory allowance. An argument of type User is expected.",
  },
];
module.exports.description =
  "Check your memory in use and left, and buy or sell some";
module.exports.xp = 1;
module.exports.details =
  "Gives your or another user's memory details. Memory details include the memory size (amount of memory already using) and the memory allowance (amount of memory left before needing to buy more). You can buy or sell memory from this command if no argument for user is given.";

const sendMemory = (eventObject, account, pronoun) => {
  eventObject.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.colors.convex)
        .setTitle(`${pronoun} memory`)
        .setFooter({ text: "Convex", iconURL: config.links.logo })
        .addFields({ name: "Memory in use", value: `${account.memorySize}` })
        .addFields({ name: "Memory left", value: `${account.allowance}` })
    ],
  });
};

module.exports.action = async (eventObject, args, dbUtils) => {
  let author = eventObject.author || eventObject.user;
  if (Object.keys(args).includes("user")) {
    eventObject.guild.members.fetch(args["user"]).then(async (member) => {
      let address = utils.getAddress(
        dbUtils,
        member.user,
        eventObject,
        member.id == author.id
      );
      if (address == -1) return;
      let account = await convexUtils.getAccountDetails(address);
      if (member.id == author.id) sendMemory(eventObject, account, "Your");
      else sendMemory(eventObject, account, member.user.username + "'s");
    });
  } else {
    let address = utils.getAddress(dbUtils, author, eventObject, true);
    if (address == -1) return;
    let account = await convexUtils.getAccountDetails(address);
    eventObject.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.convex)
          .setTitle(`Your memory`)
          .setDescription(
            "Use the buttons below to buy or sell memory allowance"
          )
          .setFooter({ text: "Convex", iconURL: config.links.logo })
          .addFields({ name: "Memory in use", value: `${account.memorySize}` })
          .addFields({ name: "Memory left", value: `${account.allowance}` })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("buymemory")
            .setLabel("Buy memory")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("sellmemory")
            .setLabel("Sell memory")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  }
};

module.exports.buttons = {
  "buymemory": (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`buymemorymodal`)
      .setTitle("Buy memory");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("amount")
          .setLabel("Amount")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  },
  "sellmemory": (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`sellmemorymodal`)
      .setTitle("Sell memory");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("amount")
          .setLabel("Amount")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  }
};
module.exports.modals = {
    "buymemorymodal": (interaction, dbUtils, args) => {
      if (!argUtils.checkInt(interaction.fields.getTextInputValue("amount"), interaction, "Amount")) return;
      convexUtils.makeTransaction(dbUtils, interaction, (interaction.author || interaction.user).id, `(set-memory (+ *memory* ${interaction.fields.getTextInputValue("amount")}))`, "Memory transfer");
    },
    "sellmemorymodal": (interaction, dbUtils, args) => {
      if (!argUtils.checkInt(interaction.fields.getTextInputValue("amount"), interaction, "Amount")) return;
      convexUtils.makeTransaction(dbUtils, interaction, (interaction.author || interaction.user).id, `(set-memory (- *memory* ${interaction.fields.getTextInputValue("amount")}))`, "Memory transfer");
    }
};
