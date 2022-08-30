const {
  ModalBuilder,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const config = require("../../config.json");
const argUtils = require("../../utils/arg");
const convexUtils = require("../../utils/convex");
const queryUtils = require("../../utils/query");

module.exports.args = [
  {
    name: "action",
    type: "String",
    description: "Create, List or Transfer fungibles?",
    details:
      "Choose wether you want to create new fungibles, list them or transfer them to someone else. Any token you own can be transfered, but only those with aliases will appear in the list.",
    required: true,
    choices: [
      { name: "list", value: "list" },
      { name: "transfer", value: "transfer" },
      { name: "create", value: "create" },
    ],
  },
  {
    name: "user",
    type: "User",
    description: "the user concerned by your action, if any",
    required: false,
    details:
      "If an argument is given when listing fungible tokens, you will get the list of the user's fungible tokens. If an argument is given when transferring tokens, will transfer to the user. An argument cannot be given when creating a token.",
  },
];
module.exports.description = "Manage your fungible tokens on a basic level";
module.exports.xp = 10;
module.exports.details =
  "This command allows you to directly manage your fungible tokens: create them, transfer them and list those with aliases";
module.exports.action = (eventObject, args, dbUtils) => {
  switch (args["action"]) {
    case "create":
      if (args["user"] != undefined) {
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setFooter({
                text: "Convex",
                iconURL: config.links.ressources.logo,
              })
              .setTitle("Error")
              .setDescription(
                "Cannot give a user argument to create a fungible token"
              ),
          ],
        });
      } else if (eventObject.user == undefined) {
        eventObject.reply({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("createfungiblebutton")
                .setLabel("Create fungible token")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      } else createFungible(eventObject);
      break;
    case "transfer":
      let user = args["user"] || "null";
      if (eventObject.user == undefined) {
        eventObject.reply({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`transferfungiblebutton|${user}`)
                .setLabel("Transfer fungible token")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      } else transferFungible(eventObject, user);
      break;
    case "list":
      listFungible(eventObject, dbUtils, 1, args["user"] || null);
      break;
    default:
      eventObject.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.error))
            .setFooter({
              text: "Convex",
              iconURL: config.links.ressources.logo,
            })
            .setTitle("Error")
            .setDescription(
              `${args["action"]} was not recognized as an action`
            ),
        ],
      });
      break;
  }
};

const recursiveListConstruction = (
  left,
  ind,
  aliases,
  string,
  address,
  interaction,
  callback
) => {
  if (left == 0) {
    callback(string);
    return;
  }
  convexUtils.query(
    interaction,
    address,
    `µgetFungibleBalanceµ${aliases[ind].id}µ${address}`,
    `#${aliases[ind].id}'s balance query`,
    false,
    (val) => {
      if (isNaN(val))
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setFooter({
                text: "Convex",
                iconURL: config.links.ressources.logo,
              })
              .setTitle("Error")
              .setDescription(`Balance query returned _${val}_: unparsable`),
          ],
        });
      else {
        recursiveListConstruction(
          left - 1,
          ind + 1,
          aliases,
          string + `\n**${aliases[ind].name}** (#${aliases[ind].id}) : ${val}`,
          address,
          interaction,
          callback
        );
      }
    }
  );
};

const listFungible = async (interaction, dbUtils, spage, userarg = null) => {
  let user = interaction.author || interaction.user;
  if (userarg != null)
    user = (await interaction.guild.members.fetch(userarg)).user;
  let aliases = dbUtils.getFungibleAliases.all(user.id);
  if (aliases.length == 0) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.convex))
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo })
          .setTitle("Fungible token list")
          .setDescription(
            `${
              userarg == null ? "You" : user.username
            } registered no alias yet :(`
          ),
      ],
    });
    return;
  }
  let page = parseInt(spage);
  let string = "";
  let ind = (page - 1) * 10;
  let left = 10;
  let component = new ActionRowBuilder();
  if (page == 1)
    string = `Here is a list of the fungible tokens ${
      userarg == null ? "You" : user.username
    } have registered with an alias: \n`;
  if (page == Math.ceil(aliases.length / 10)) left = aliases.length - ind;
  if (page != 1)
    component.addComponents(
      new ButtonBuilder()
        .setCustomId(`listpage|${page - 1}`)
        .setLabel("Previous page")
        .setStyle(ButtonStyle.Primary)
    );
  if (page != Math.ceil(aliases.length / 10))
    component.addComponents(
      new ButtonBuilder()
        .setCustomId(`listpage|${page + 1}`)
        .setLabel("Next page")
        .setStyle(ButtonStyle.Primary)
    );
  let embed = new EmbedBuilder()
    .setTitle(`List of fungible tokens`)
    .setColor(config.colors.convex)
    .setFooter({
      text: `Page ${page}/${Math.ceil(aliases.length / 10)}`,
      iconURL: config.links.ressources.logo,
    });
  let address = queryUtils.getAddress(
    dbUtils,
    user.id,
    user.username,
    interaction,
    true
  );
  if (address == -1) return;
  recursiveListConstruction(
    left,
    ind,
    aliases,
    string,
    address,
    interaction,
    (str) => {
      embed.setDescription(str);
      interaction.reply({
        embeds: [embed],
        components: [component],
      });
    }
  );
};

const createFungible = (interaction) => {
  let modal = new ModalBuilder()
    .setCustomId(`createfungible`)
    .setTitle("Fungible token details");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("supply")
        .setLabel("Total supply")
        .setStyle(TextInputStyle.Short)
    )
  );
  interaction.showModal(modal);
};

const transferFungible = (interaction, user) => {
  let modal = new ModalBuilder()
    .setCustomId(`transferfungible|${user}`)
    .setTitle("Transfer details");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("fungible")
        .setLabel("Fungible token's address")
        .setStyle(TextInputStyle.Short)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("quantity")
        .setLabel("Quantity")
        .setStyle(TextInputStyle.Short)
    )
  );
  if (user == "null")
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("receiver")
          .setLabel("Receiver's address")
          .setStyle(TextInputStyle.Short)
      )
    );
  interaction.showModal(modal);
};

module.exports.buttons = {
  createfungiblebutton: (interaction, dbUtils, args) => {
    createFungible(interaction);
  },
  transferfungiblebutton: (interaction, dbUtils, args) => {
    transferFungible(interaction, args[0]);
  },
  setfungiblealias: (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`setfungiblealias|${args[0]}`)
      .setTitle(`Alias creation for token ${args[0]}`);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("name")
          .setLabel("Name")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  },
  listpage: (interaction, dbUtils, args) => {
    listFungible(interaction, dbUtils, args[0]);
  },
};

module.exports.modals = {
  setfungiblealias: (interaction, dbUtils, args) => {
    dbUtils.newAlias.run(
      interaction.user.id,
      interaction.fields.getTextInputValue("name"),
      args[0].split("#")[0],
      "fungible"
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            `Successfully registered ${interaction.fields.getTextInputValue(
              "name"
            )}`
          )
          .setColor(config.colors.success)
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ],
    });
  },
  createfungible: (interaction, dbUtils, args) => {
    if (
      !argUtils.checkInt(
        interaction.fields.getTextInputValue("supply"),
        interaction,
        "Total supply"
      )
    )
      return;
    convexUtils.makeTransaction(
      dbUtils,
      interaction,
      interaction.user.id,
      `µcreateFungibleµ${interaction.fields.getTextInputValue("supply")}`,
      "Fungible token creation",
      false,
      "createdfungible"
    );
  },
  transferfungible: async (interaction, dbUtils, args) => {
    let quantity = interaction.fields.getTextInputValue("quantity");
    let funid =
      dbUtils.searchAlias.get(
        interaction.user.id,
        interaction.fields.getTextInputValue("fungible")
      ) || interaction.fields.getTextInputValue("fungible").split("#").join("");
    let receiverid;
    if (args[0] == "null")
      receiverid = interaction.fields
        .getTextInputValue("receiver")
        .split("#")
        .join("");
    else {
      let user = await interaction.guild.members.fetch(args[0]);
      receiverid = queryUtils.getAddress(
        dbUtils,
        args[0],
        user.username,
        interaction,
        args[0] == interaction.user.id
      );
    }
    if (!argUtils.checkInt(quantity, interaction, "Quantity")) return;
    if (
      !argUtils.checkInt(
        funid,
        interaction,
        "Fungible token's address or alias",
        `Alias ${interaction.fields.getTextInputValue(
          "fungible"
        )} not recognized`
      )
    )
      return;
    if (!argUtils.checkInt(receiverid, interaction, "Receiver's address"))
      return;
    convexUtils.makeTransaction(
      dbUtils,
      interaction,
      interaction.user.id,
      `µtransferFungibleµ${funid}µ${quantity}µ${receiverid}`,
      "Transfer"
    );
  },
};

module.exports.callbacks = {
  createdfungible: (interaction, dbUtils, arg) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Successfully created fungible token ${arg}`)
          .setDescription(
            "Do you want to create an alias for it? Alias will give you an easy access to this token later on."
          )
          .setColor(config.colors.success)
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`setfungiblealias|${arg}`)
            .setLabel("Create alias")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  },
};
