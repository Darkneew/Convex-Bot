const {
  ModalBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const config = require("../../config.json");
const argUtils = require("../../utils/arg");

module.exports.args = [
  {
    name: "type",
    type: "String",
    description: "Set or remove alias of fungible token or nft",
    details: "Wether you want to set the alias of a nft or fungible token. Choose remove to remove an alias from your aliases",
    required: true,
    choices: [
      { name: "fungible", value: "fungible" },
      { name: "nft", value: "nft" },
      { name: "remove", value: "remove"}
    ],
  },
];
module.exports.description = "Create aliases for your assets";
module.exports.xp = 2;
module.exports.onlyInteraction = true;
module.exports.details =
  "Lets you create or delete aliases for your assets. Having an alias for an asset allows you to use the name instead of the address each time prompted, as well as display your balance of this asset when listing your assets";
module.exports.action = (eventObject, args, dbUtils) => {
    if (args["type"] == "remove") {
        let modal = new ModalBuilder()
        .setCustomId("removealias")
        .setTitle("Remove alias");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address")
            .setLabel("Asset's address or alias")
            .setStyle(TextInputStyle.Short)
        )
      );
      eventObject.showModal(modal);
    } else {
        let modal = new ModalBuilder()
        .setCustomId(`setalias|${args["type"]}`)
        .setTitle("Set alias");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address")
            .setLabel("Asset's address")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Name")
            .setStyle(TextInputStyle.Short)
        )
      );
      eventObject.showModal(modal);
    }
  
};


module.exports.buttons = {};
module.exports.modals = {
  setalias: (interaction, dbUtils, args) => {
    let add = interaction.fields.getTextInputValue("address").split("#").join("");
    if (!argUtils.checkInt(add, interaction, "Address")) return;
    dbUtils.newAlias.run(
        interaction.user.id,
        interaction.fields.getTextInputValue("name"),
        add,
        args[0]
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Success")
          .setColor(config.colors.success)
          .setDescription(
            `Alias #${
                interaction.fields.getTextInputValue("address")} successfully registered as  ${
                    interaction.fields.getTextInputValue("name")}`
          )
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ],
    });
  },
  removealias: (interaction, dbUtils, args) => {
    let add = interaction.fields.getTextInputValue("address").split("#").join("");
    if (isNaN(add)) { add = interaction.fields.getTextInputValue("address"); dbUtils.removeAliasByName.run(add); }
    else { dbUtils.removeAliasByAddress.run(add); add = "#" + add; }
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Success")
          .setColor(config.colors.success)
          .setDescription(
            `Alias _${add}_ successfully removed`
          )
          .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
      ],
    });
  }
};

module.exports.callbacks = {};