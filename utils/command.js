const fs = require("fs");
  
module.exports.register = async () => {
  const { SlashCommandBuilder, Routes } = require("discord.js");
  const { REST } = require("@discordjs/rest");
  const { token, clientId } = require("../config.json");

  let commands = [];
  let addCommand = (path, nameWithExtension, mainCommand) => {
    let x = path.split(".");
    x.pop();
    let module = x.join(".");
    let y = nameWithExtension.split(".");
    y.pop();
    let name = y.join(".");
    let { args, description } = require(module);
    if (mainCommand == null) {
    let cmd = new SlashCommandBuilder().setName(name).setDescription(description);
    args.forEach((arg) => {
      cmd[`add${arg.type}Option`]((option) => {
      option.setName(arg.name).setDescription(arg.description);
      if ("required" in arg) option.setRequired(arg["required"]);
      if ("choices" in arg) option.addChoices(arg["choices"]);
      return option;
      });
    });
    commands.push(cmd);
    }
    else mainCommand.addSubcommand(cmd => {
    cmd.setName(name).setDescription(description);
    args.forEach((arg) => {
      cmd[`add${arg.type}Option`]((option) => {
      option.setName(arg.name).setDescription(arg.description);
      if ("required" in arg) option.setRequired(arg["required"]);
      if ("choices" in arg) arg["choices"].forEach(opt => option.addChoices(opt));
      return option;
      });
    });
    return cmd;
    });
  };

  let filenames = fs.readdirSync("./commands/");
  filenames.forEach((filename) => {
    if (filename.endsWith(".js")) {
      addCommand(`./commands/${filename}`, filename, null);
      return;
    }
    cmd = new SlashCommandBuilder()
      .setName(filename)
      .setDescription(
        require(`./commands/${filename}/${filename}`).description
      );
    let _filenames = fs.readdirSync(`./commands/${filename}/`);
    _filenames.forEach((_filename) => {
      if (_filename == filename + ".js") return;
          if (_filename.endsWith(".js"))
            addCommand(`./commands/${filename}/${_filename}`, _filename, cmd);
          else
            console.log(
              `folder ./commands/${filename}/${_filename} is causing issues`
            );
        })
    commands.push(cmd);
  });
  commands.map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(token);
  await rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("Commands registered"))
    .catch(console.error);
}

module.exports.get = () => {
  let commands = {};
  let buttons = {};
  let modals = {};

  let addCommand = (path, nameWithExtension, directoryName) => {
    let x = path.split(".");
    x.pop();
    let module = x.join(".");
    let y = nameWithExtension.split(".");
    y.pop();
    let name = y.join(".");
    if (directoryName == name) return;
    let cmd = require(module);
    if (directoryName != null) commands[directoryName][name] = cmd;
    else commands[name] = cmd;
    Object.entries(cmd.buttons).forEach((x) => {
      buttons[x[0]] = x[1];
    });
    Object.entries(cmd.modals).forEach((x) => {
      modals[x[0]] = x[1];
    });
  };

  let filenames = fs.readdirSync("./commands/");
  filenames.forEach((filename) => {
    if (filename.endsWith(".js"))
      addCommand(`./commands/${filename}`, filename, null);
    else {
      commands[filename] = {};
      let _filenames = fs.readdirSync(`./commands/${filename}/`);
      _filenames.forEach((_filename) => {
        if (_filename.endsWith(".js"))
          addCommand(
            `./commands/${filename}/${_filename}`,
            _filename,
            filename
          );
        else
          console.log(
            `./commands/${filename}/${_filename} is causing issues`
          );
      });
    }
  });
  return { "Commands": commands, "Buttons": buttons, "Modals": modals };
}