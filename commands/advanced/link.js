const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const config = require("../../config.json");

module.exports.args = [
  {
    name: "link",
    type: "String",
    description: "The link you want to get",
    details:
      "Choose among a list of useful links you can get",
    required: true,
    choices: (() => {
      let choices = [];
      Object.keys(config.links.commands).forEach((v) => {
        choices.push({ name: v, value: v });
      });
      return choices;
    })()
  }
];
module.exports.description = "Returns useful links";
module.exports.xp = 4;
module.exports.details = "Something about convex you are looking for? Look no more, here is a list of most useful links";
module.exports.action = (eventObject, args, dbUtils) => {
  eventObject.reply({
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(config.links.commands[args["link"]])
          .setLabel(args["link"])
          .setStyle(ButtonStyle.Link)
      )
    ]
  });
};

module.exports.buttons = {};
module.exports.modals = {};
module.exports.callbacks = {};
