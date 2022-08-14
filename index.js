// INITIALIZATION
const fs = require("fs");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const config = require("./config.json");
const dbUtils = require("./dbUtils");
const argUtils = require("./argUtils");
const commandUtils = require("./commandUtils");
const { waitForDebugger } = require("inspector");
// to clean after finishing everything
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});


// OPEN DATABASE
// GETTING COMMANDS
const Commands = (() => {
  let commands = {};

  let addCommand = (path, nameWithExtension, directoryName) => {
    let x = path.split(".");
    x.pop();
    let module = x.join(".");
    let y = nameWithExtension.split(".");
    y.pop();
    let name = y.join(".");
    if (directoryName == name) return;
    if (directoryName != null) commands[directoryName][name] = require(module);
    else commands[name] = require(module);
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
  return commands;
})();

client.on("interactionCreate", async (interaction) => {
  // REPLY TO FORMAL COMMANDS
  if (interaction.isCommand()) {
    if (interaction.guild != null) dbUtils.getPrefix(interaction.guild.id);
    let cmd = Commands[interaction.commandName];
    if (interaction.options.data.length > 0 && interaction.options.data[0].type == 1) cmd = cmd[interaction.options.data[0].name];
    if (cmd == undefined) {
      interaction.channel.send({ embeds: [
        new EmbedBuilder()
        .setColor(parseInt(config.colors.error))
        .setTitle("Error")
        .setDescription("Internal Error - Command not found")
      ]});
      return;
    } 
    dbUtils.addXP(interaction.user.id, cmd.xp);
    if (interaction.options.data.length > 0 && interaction.options.data[0].type == 1) {
      cmd.action(interaction, Object.assign({}, ...interaction.options.data[0].options.map(
        (obj) => ({[obj.name]: obj.value})
      )), dbUtils
      );
    } else {
      cmd.action(interaction, Object.assign({}, ...interaction.options.data.map(
        (obj) => ({[obj.name]: obj.value}) 
      )), dbUtils
      );
    }
  }
});

client.on("messageCreate", async (message) => {
  let prefix = null;
  if (message.guild != null) {
    prefix = dbUtils.getPrefix(message.guildId);
  }
  // REPLY TO MENTIONS
  if (message.content.split(" ").length == 1 && message.mentions.users.first() == client.user) {
    let embed = new EmbedBuilder()
      .setColor(config.colors.convex)
      .setTitle("Hi")
      .setDescription("Use my help command (/help) to get some help whenever you feel lost!");
    if (prefix) embed.addFields({"name":"Prefix", "value":`The prefix for this server is ${prefix}. If you don't want to use discord commands for some reason, you can simply type the command as a message while starting it with ${prefix}.`});
    message.channel.send({ embeds: [embed] });
  };
  if (prefix != null && !message.content.startsWith(prefix)) return;
  // REPLY TO TEXT COMMANDS
  let text = message.content
  if (prefix != null) text = text.split("").splice(prefix.length).join("").split(" ");
  let cmd = Commands[text[0]];
  if (!cmd) return;
  cmd = cmd[text[1]] || cmd;
  let arg = await argUtils.process(text.splice(2), cmd.args, message);
  if (!arg) return;
  dbUtils.addXP(message.author.id, cmd.xp);
  cmd.action(message, arg, dbUtils);
});


// When ready
client.once("ready", () => {
	console.log("Bot up and running");
});

// STOP THE BOT 
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
process.on('exit', () => {
  dbUtils.db.close();
  console.log("Database closed");
  console.log("Bot down"); // check when bot is down, or stop it?
});

// START THE BOT
let args = process.argv.splice(2);
if (args.includes("--init") || args.includes("-i")) {
  if (fs.existsSync("./database.db")) fs.unlinkSync("./database.db");
  commandUtils.register();
}
dbUtils.openDb();
if (args.includes("--init") || args.includes("-i")) dbUtils.init();
dbUtils.prepareStatements();
client.login(config.token);

