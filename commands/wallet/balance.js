const queryUtils = require("../../utils/query");
const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const convexUtils = require("../../utils/convex");
const config = require("../../config.json");
const argUtils = require("../../utils/arg");

module.exports.args = [
  {
    name: "user",
    type: "User",
    description: "the user you want to check the balance of",
    required: false,
    details:
      "If this argument is given, it will allow you to check someone else's balance. An argument of type User is expected.",
  },
];
module.exports.description = "Check your balance of Convex coins";
module.exports.xp = 1;
module.exports.details =
  "Gives your or another user's balance of Convex coins. You can buy coins (request them while in Beta) and transfer them to different account if you check your own balance.";

const sendBalance = (eventObject, balance, pronoun) => {
  let embed = new EmbedBuilder()
    .setColor(config.colors.convex)
    .setFooter({ text: "Convex", iconURL: config.links.ressources.logo });
  let comp = [];
  if (pronoun == "You") {
    embed.setTitle(`${pronoun} have a balance of ${balance} coins`);
    comp = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("buycoins")
          .setLabel("Buy coins")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("transfercoins")
          .setLabel("Transfer coins")
          .setStyle(ButtonStyle.Primary)
      ),
    ];
  } else embed.setTitle(`${pronoun} has a balance of ${balance} coins`);
  eventObject.reply({
    embeds: [embed],
    components: comp,
  });
};

module.exports.action = async (eventObject, args, dbUtils) => {
  let author = eventObject.author || eventObject.user;
  if (Object.keys(args).includes("user")) {
    eventObject.guild.members.fetch(args["user"]).then(async (member) => {
      let address = queryUtils.getAddress(
        dbUtils,
        member.id,
        member.user.username,
        eventObject,
        member.id == author.id
      );
      if (address == -1) return;
      let account = await convexUtils.getAccountDetails(address);
      let balance = account.balance;
      if (member.id == author.id) sendBalance(eventObject, balance, "You");
      else sendBalance(eventObject, balance, member.user.username);
    });
  } else {
    let address = queryUtils.getAddress(
      dbUtils,
      author.id,
      author.username,
      eventObject,
      true
    );
    if (address == -1) return;
    let account = await convexUtils.getAccountDetails(address);
    let balance = account.balance;
    sendBalance(eventObject, balance, "You");
  }
};

module.exports.buttons = {
  buycoins: (interaction, dbUtils, args) => {
    interaction.showModal(
      new ModalBuilder()
        .setTitle("Request details")
        .setCustomId(`requestcoins`)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("amount")
              .setLabel("Amount")
              .setStyle(TextInputStyle.Short)
          )
        )
    );
  },
  transfercoins: (interaction, dbUtils, args) => {
    interaction.showModal(
      new ModalBuilder()
        .setTitle("Transfer details")
        .setCustomId(`transfercoins`)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("amount")
              .setLabel("Amount")
              .setStyle(TextInputStyle.Short)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("address")
              .setLabel("Address to transfer to")
              .setStyle(TextInputStyle.Short)
          )
        )
    );
  },
};
module.exports.modals = {
  requestcoins: (interaction, dbUtils, args) => {
    if (
      !argUtils.checkInt(
        interaction.fields.getTextInputValue("amount"),
        interaction,
        "Amount"
      )
    )
      return;
    convexUtils.requestMoney(
      dbUtils,
      interaction,
      interaction.user.id,
      parseInt(interaction.fields.getTextInputValue("amount"))
    );
  },
};

module.exports.callbacks = {};