module.exports.args = [
  {
    name: "module",
    type: "String",
    description: "The module you want help on",
    required: false,
  },
  {
    name: "command",
    type: "String",
    description: "The command you want help on",
    required: false,
  },
  {
    name: "parameter",
    type: "String",
    description: "The parameter you want help on",
    required: false,
  },
];
module.exports.description = "Get help";
module.exports.xp = 1;
module.exports.details =
  "To get help. Precise a module to get help on a module, a command to get help on this command in the module, and a parameter to get help on a parameter in this command. If no arguments are given, a navigator will be created to navigate through the bot.";
module.exports.action = (eventObject, args, dbUtils) => {
  eventObject.reply("wip");
};

module.exports.buttons = {};
module.exports.modals = {};
