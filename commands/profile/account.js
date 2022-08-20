const config = require("../../config.json");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports.args = [
  {
    name: "action",
    type: "String",
    description: "wether you want to create an account, change your account, or get your keys",
    details: "Choose 'create' to create a new account. If you already have an account linked but want to change, choose 'change'. Finally, choose 'get' to get your public key and interkey.",
    required: true,
    choices: [
      {
        name: "create",
        value: "create",
      },
      {
        name: "change",
        value: "change",
      },
      {
        name: "get",
        value: "get",
      }
    ],
  },
];
module.exports.description = "Manage your convex account";
module.exports.details = "Manage the convex account linked to your discord account: create one, change it or retrieve your keys. By choosing create or change, you will also be given the possibility of linking a convex account made outside of discord.";
module.exports.xp = 50;

const NewOrExistingQuestion = (eventObject) => {
    eventObject.reply({embeds:[
        new EmbedBuilder()
        .setTitle("Do you want to create a new account, or do you want to register an already existing account?")
        .setColor(config.colors.question)
        .setFooter({text:"Convex", iconURL: config.links.logo })
    ], 
    components: [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("newaccount")
            .setLabel("New account")
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId("existingaccount")
            .setLabel("Existing account")
            .setStyle(ButtonStyle.Secondary)
        ),
    ]});
}

module.exports.action = (eventObject, args, dbUtils) => {
  switch (args.action) {
    case "create":
      let a = dbUtils.getUserAddress.get((eventObject.author || eventObject.user).id);
      if (a) {
        eventObject.reply({embeds:[
          new EmbedBuilder()
          .setTitle(`You already have a convex account registered by me (#${a}). Do you still want to continue, and change acount?`)
          .setColor(config.colors.question)
          .setFooter({text:"Convex", iconURL: config.links.logo })
        ], 
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("NoEQ")
                .setLabel("Proceed")
                .setStyle(ButtonStyle.Primary)
            ),
        ]});
      } else NewOrExistingQuestion(eventObject);
      break;
    case "change":
      let b = db.getUserAddress.get((eventObject.author || eventObject.user).id);
      if (!b) {
        eventObject.reply({embeds:[
          new EmbedBuilder()
          .setTitle(`You don't have any convex account yet. Do you want to create your convex account??`)
          .setColor(config.colors.question)
          .setFooter({text:"Convex", iconURL: config.links.logo })
        ], 
        components: [
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("NoEQ")
                .setLabel("Proceed")
                .setStyle(ButtonStyle.Primary)
            ),
        ]});
      } else NewOrExistingQuestion(eventObject);
      break;
    case "get":
      let account = dbUtils.getUserAccount.get((eventObject.author || eventObject.user).id);
      if (account == undefined) {
        eventObject.reply({embeds:[
          new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setTitle("Error")
          .setDescription(`Can't retreive your account: you don't have one.`)
        ]});
      } else eventObject.reply({embeds:[
        new EmbedBuilder()
        .setTitle(`Your account:`)
        .setColor(config.colors.convex)
        .addFields([
          {"name":"Address", "value": account.address},
          {"name": "Public key", "value": account.publickey},
          {"name": "Interkey", "value": account.interkey}
        ])
        .setFooter({text:"Convex", iconURL: config.links.logo })
      ], ephemeral: true });
      break;
    default:
      eventObject.reply({ embeds: [
      new EmbedBuilder()
        .setColor(parseInt(config.colors.error))
        .setTitle("Error")
        .setDescription(`Internal error - ${args.action} not recognized as an action.`)
      ]});
      break;
  }
};

module.exports.buttons = {
  "NoEQ": (interaction, dbUtils) => {
    NewOrExistingQuestion(interaction)
  },
  "existingaccount": (interaction, dbUtils) => {
    interaction.reply({embeds:[
      new EmbedBuilder()
      .setTitle("Do you want to generate the interkey or let me do it?")
      .addFields({"name":"Generate it", "value":"If you want to generate your interkey yourself, you only have to download a small app to do it"})
      .addFields({"name":"Let me do it", "value":"If you let me do it, you will have to send your private key on discord (not secure)"})
      .setColor(config.colors.question)
      .setFooter({text:"Convex", iconURL: config.links.logo })
    ], 
    components: [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("enterkeyswithaccount")
            .setLabel("Generate it")
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId("generateinterkey")
            .setLabel("Let me do it")
            .setStyle(ButtonStyle.Secondary)
        ),
    ]});
  },
  "newaccount": (interaction, dbUtils) => {
    interaction.reply({embeds:[
      new EmbedBuilder()
      .setTitle("Do you want me to create the account or do you want to create it yourself?")
      .addFields({"name":"Let me do it", "value":"If you let me do it and want to retreive your private key, you will later either need me to send your private key on discord (not secure) or download a small app to get it yourself."})
      .addFields({"name":"Create it yourself", "value":"If you create your account yourself, you will need to download a small app to do it, but will immediatly be in possession of all your keys."})
      .setColor(config.colors.question)
      .setFooter({text:"Convex", iconURL: config.links.logo })
    ], 
    components: [
        new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("createaccount")
            .setLabel("Let me do it")
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId("enterkeyswithoutaccount")
            .setLabel("Do it yourself")
            .setStyle(ButtonStyle.Secondary)
        ),
    ]});
  }, // BEGIN WIP
  "createaccount": (interaction, dbUtils) => {
    console.log("createaccount")
  },
  "enterkeyswithoutaccount": (interaction, dbUtils) => {
    console.log("enterkeyswithoutaccount")
  },
  "generateinterkey": (interaction, dbUtils) => {
    console.log("generateinterkey")
  },
  "enterkeyswithaccount": (interaction, dbUtils) => {
    console.log("enterkeyswithaccount")
  } // END WIP
};

module.exports.modals = {};