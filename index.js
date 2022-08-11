// tmp
const prefix = "$";

// Initialization
const fs = require("fs");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const config = require("./config.json");
const argUtils = require("./argUtils");
const commandUtils = require("./commandUtils");
const dbUtils = require("./dbUtils");

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

var db;

// Getting commands
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
    if (directoryName != null) name = directoryName + " " + name;
    commands[name] = require(module);
  };

  let filenames = fs.readdirSync("./commands/");
  filenames.forEach((filename) => {
    if (filename.endsWith(".js"))
      addCommand(`./commands/${filename}`, filename, null);
    else {
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
  // reply to formal commands
  // if no account for user create one
  // if no account for guild create one
  if (interaction.isCommand()) {
    let cmd = Commands[interaction.commandName] || Commands[interaction.commandName + " " + interaction.options.data[0].name];
    if (cmd == undefined) {
      interaction.channel.send({ embeds: [
        new EmbedBuilder()
        .setColor(parseInt(config.colors.error))
        .setTitle("Error")
        .setDescription("Internal Error - Command not found")
      ]});
      return;
    } 
    if (interaction.options.data.length > 0 && interaction.options.data[0].type == 1) {
      cmd.action(interaction, Object.assign({}, ...interaction.options.data[0].options.map(
        (obj) => ({[obj.name]: obj.value}, db) 
      )
      ));
    } else {
      cmd.action(interaction, Object.assign({}, ...interaction.options.data.map(
        (obj) => ({[obj.name]: obj.value}, db) 
      )
      ));
    }
    
  }
});

// reply to text commands
client.on("messageCreate", async (message) => {
  if (message.content.split(" ").length == 1 && message.mentions.users.first() == client.user) {
    let embed = new EmbedBuilder()
      .setColor(config.colors.help)
      .setTitle("Hi")
      .setDescription("Use my help command (/help) to get some help whenever you feel lost!");
      // add prefix if not dm
    message.channel.send({ embeds: [embed] });
  }
  if (!message.content.startsWith(prefix)) return;
  // if no account for user create one
  // if no account for guild create one
  let text = message.content.split("").splice(1).join("").split(" ");
  if (Object.keys(Commands).includes(text[0])) {
    let arg = await argUtils.process(text.splice(1), Commands[text[0]].args, message);
    if (arg == null) return;
    Commands[text[0]].action(message, arg, db);
  } else if (Object.keys(Commands).includes(text[0] + " " + text[1])) {
    let arg = await argUtils.process(text.splice(2), Commands[text[0] + " " + text[1]].args, message);
    if (arg == null) return;
    Commands[text[0] + " " + text[1]].action(message, arg, db);
  }
});

client.once("ready", () => {
	let args = process.argv.splice(2);
	if (args.includes("--init") || args.includes("-i")) {
		if (fs.existsSync("./database.db")) fs.unlinkSync("./database.db");
		commandUtils.register().then((e) => {
			if (e) throw e;
			db = dbUtils.init();
			console.log("Bot up and running!");
		});
	}
	else {
    db = dbUtils.connect();
    console.log("Bot up and running");  
  }
});

client.login(config.token);
