const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const config = require("../config.json");

module.exports.args = [
  {
    name: "module",
    type: "String",
    description: "The module you want help on",
    details:
      "If a module is given with this argument, the help command will focus on this module.",
    required: false,
  },
  {
    name: "command",
    type: "String",
    description: "The command you want help on",
    details:
      "If a command is given with this argument, the help command will focus on this command. If the command is in a module, the module parameter must also be filled",
    required: false,
  },
  {
    name: "parameter",
    type: "String",
    description: "The parameter you want help on",
    details:
      "If a parameter is given with this argument, the help command will focus on this parameter. The command associated with the parameter must be precised through the command argument. The same rule applies for modules.",
    required: false,
  },
];
module.exports.description = "Get help";
module.exports.xp = 1;
module.exports.details =
  "To get help. Precise a module to get help on a module, a command to get help on this command in the module, and a parameter to get help on a parameter in this command. If no arguments are given, a navigator will be created to navigate through the bot.";

const toComp = (buttons) => {
  let comps = [];
  let row = null;
  for (let i = 0; i < buttons.length; i++) {
    if (i % 5 == 0) row = new ActionRowBuilder();
    row.addComponents(buttons[i]);
    if (i % 5 == 4) {
      comps.push(row);
      row = null;
    }
  }
  if (row != null) comps.push(row);
  return comps;
};

const findFirst = (obj, filter) => {
  for (let i = 0; i < obj.length; i++) {
    if (filter(obj[i])) return obj[i];
  }
  return undefined;
};

const helpGeneral = (eventObject, prefix, isMod, commands) => {
  let embed = new EmbedBuilder()
    .setTitle(`Help navigator : General`)
    .setColor(config.colors.convex)
    .setFooter({ text: "Convex", iconURL: config.links.ressources.logo });
  if (prefix == "")
    embed.setDescription(
      `Welcome to the help navigator!\n\nHere, you can explore the diverse modules and commands. Click on the buttons below to get precision on something.\n\n Here is a list of all **modules** and commands without module:`
    );
  else
    embed.setDescription(
      `Welcome to the help navigator!\n\nHere, you can explore the diverse modules and commands. Click on the buttons below to get precision on something.\n\nThe prefix for this server is ${prefix}. \nHere is a list of all modules and commands without module:`
    );
  let buttons = [];
  Object.keys(commands).forEach((name) => {
    let customId = `help|null|${name}`;
    let n = name + " (command)";
    if (Object.keys(commands[name]).includes("#isModule")) {
      customId = `help|${name}`;
      n = name;
    } else if (
      !isMod &&
      Object.keys(commands[name]).includes("adminCommand") &&
      commands[name]["adminCommand"]
    )
      return;
    embed.addFields({
      name: n,
      value: commands[name]["#description"] || commands[name].description,
    });
    buttons.push(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(name)
        .setStyle(ButtonStyle.Primary)
    );
  });
  eventObject.reply({ embeds: [embed], components: toComp(buttons) });
};

const helpModule = (eventObject, isMod, commands, moduleName) => {
  let embed = new EmbedBuilder()
    .setTitle(`Help navigator : General > ${moduleName}`)
    .setColor(config.colors.convex)
    .setDescription(
      commands[moduleName]["#details"] +
        `\n\nHere is a list of the commands in this module:`
    )
    .setFooter({ text: "Convex", iconURL: config.links.ressources.logo });
  let buttons = [
    new ButtonBuilder()
      .setCustomId("help")
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary),
  ];
  Object.keys(commands[moduleName]).forEach((name) => {
    if (name.startsWith("#")) return;
    if (
      !isMod &&
      Object.keys(commands[moduleName][name]).includes("adminCommand") &&
      commands[moduleName][name]["adminCommand"]
    )
      return;
    embed.addFields({
      name: name,
      value: commands[moduleName][name].description,
    });
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`help|${moduleName}|${name}`)
        .setLabel(name)
        .setStyle(ButtonStyle.Primary)
    );
  });
  eventObject.reply({ embeds: [embed], components: toComp(buttons) });
};

const helpCommand = (eventObject, commands, commandName, moduleName = null) => {
  let title = `${moduleName} > ${commandName}`;
  let stringArg = `${moduleName}|${commandName}`;
  let cmd;
  if (moduleName == null) {
    cmd = commands[commandName];
    title = commandName;
    stringArg = `null|${commandName}`;
  } else cmd = commands[moduleName][commandName];
  let embed = new EmbedBuilder()
    .setTitle(`Help navigator : General > ${title}`)
    .setColor(config.colors.convex)
    .setFooter({ text: "Convex", iconURL: config.links.ressources.logo });
  if (cmd.args.length > 0)
    embed.setDescription(
      cmd.details + `\n\nHere is a list of the command's parameters:`
    );
  else embed.setDescription(cmd.details);
  let backId = `help|${moduleName}`;
  if (moduleName == null) backId = `help`;
  let buttons = [
    new ButtonBuilder()
      .setCustomId(backId)
      .setLabel("Go Back")
      .setStyle(ButtonStyle.Primary),
  ];
  cmd.args.forEach((arg) => {
    let n = arg.name;
    if (Object.keys(arg).includes("required") && !arg.required) n += " (optional)";
    embed.addFields({
      name: n,
      value: arg.description,
    });
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`help|${stringArg}|${arg.name}`)
        .setLabel(arg.name)
        .setStyle(ButtonStyle.Primary)
    );
  });
  eventObject.reply({ embeds: [embed], components: toComp(buttons) });
};

const helpParameter = (
  eventObject,
  commands,
  parameter,
  commandName,
  moduleName = null
) => {
  let title = `${moduleName} > ${commandName}`;
  let stringArg = `${moduleName}|${commandName}`;
  let cmd;
  if (moduleName == null) {
    cmd = commands[commandName];
    title = commandName;
    stringArg = `null|${commandName}`;
  } else cmd = commands[moduleName][commandName];
  let param = findFirst(cmd.args, (arg) => arg.name == parameter);
  let embed = new EmbedBuilder()
    .setTitle(`Help navigator : General > ${title} > ${parameter}`)
    .setColor(config.colors.convex)
    .setDescription(param.details)
    .setFooter({ text: "Convex", iconURL: config.links.ressources.logo });
  let backId = `help|${stringArg}`;
  eventObject.reply({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(backId)
          .setLabel("Go Back")
          .setStyle(ButtonStyle.Primary)
      ),
    ],
  });
};

const noExist = (eventObject, name) => {
  eventObject.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Error`)
        .setColor(config.colors.error)
        .setDescription(`Couldn't find ${name}`)
        .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
    ],
  });
};

const helpFromArgArray = (interaction, dbUtils, args, commands) => {
  if (args.length == 0)
    helpGeneral(
      interaction,
      dbUtils.getGuildPrefix.get(interaction.guild.id),
      config.botModerators.includes((interaction.user || interaction.author).id),
      commands
    );
  else if (args.length == 1) {
    if (Object.keys(commands).includes(args[0]))
      helpModule(
        interaction,
        config.botModerators.includes((interaction.user || interaction.author).id),
        commands,
        args[0]
      );
    else noExist(interaction, `Module ${args[0]}`);
  } else if (args.length == 2) {
    if (args[0] == "null") {
      if (Object.keys(commands).includes(args[1]))
        helpCommand(interaction, commands, args[1], null);
      else noExist(interaction, `Command ${args[1]}`);
    } else {
      if (Object.keys(commands).includes(args[0])) {
        if (Object.keys(commands[args[0]]).includes(args[1]))
          helpCommand(interaction, commands, args[1], args[0]);
        else noExist(interaction, `Command ${args[0]} ${args[1]}`);
      } else noExist(interaction, `Module ${args[0]}`);
    }
  } else if (args.length == 3) {
    if (args[0] == "null") {
      if (Object.keys(commands).includes(args[1])) {
        if (
          findFirst(commands[args[1]].args, (arg) => arg.name == args[2]) ==
          undefined
        )
          noExist(interaction, `Parameter ${args[2]} from ${args[1]}`);
        else helpParameter(interaction, commands, args[2], args[1], null);
      } else noExist(interaction, `Command ${args[1]}`);
    } else {
      if (Object.keys(commands).includes(args[0])) {
        if (Object.keys(commands[args[0]]).includes(args[1])) {
          if (
            findFirst(
              commands[args[0]][args[1]].args,
              (arg) => arg.name == args[2]
            ) == undefined
          )
            noExist(
              interaction,
              `Parameter ${args[2]} from ${args[0]} ${args[1]}`
            );
          else helpParameter(interaction, commands, args[2], args[1], args[0]);
        } else noExist(interaction, `Command ${args[0]} ${args[1]}`);
      } else noExist(interaction, `Module ${args[0]}`);
    }
  }
};

module.exports.action = (eventObject, args, dbUtils, commands) => {
  let _args = [];
  if (Object.keys(args).includes("module")) _args.push(args["module"]);
  else _args.push("null");
  if (Object.keys(args).includes("command")) {
    _args.push(args["command"]);
    if (Object.keys(args).includes("parameter")) _args.push(args["parameter"]);
    helpFromArgArray(eventObject, dbUtils, _args, commands);
  } else {
    if (Object.keys(args).includes("parameter")) {
      eventObject.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Error`)
            .setColor(config.colors.error)
            .setDescription(
              `Cannot explain the parameter of no command. You must precise a command argument`
            )
            .setFooter({
              text: "Convex",
              iconURL: config.links.ressources.logo,
            }),
        ],
      });
    } else {
      if (_args[0] == "null")
        helpFromArgArray(eventObject, dbUtils, [], commands);
      else helpFromArgArray(eventObject, dbUtils, _args, commands);
    }
  }
};

module.exports.buttons = {
  help: helpFromArgArray,
};
module.exports.modals = {};
module.exports.callbacks = {};