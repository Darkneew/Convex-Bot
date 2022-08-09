module.exports = async () => {
  const { SlashCommandBuilder, Routes } = require("discord.js");
  const { REST } = require("@discordjs/rest");
  const { token, clientId } = require("./config.json");
  const fs = require("fs");

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
    .then(() => console.log("Commands registered!"))
    .catch(console.error);
}
