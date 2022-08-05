// tmp
const prefix = "$"

// Initialization
const fs = require("fs");
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// to clean after finishing everything
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents] });

// Getting commands
const Commands = (() => {
	let commands = {};

	let addCommand = (path, nameWithExtension, directoryName) => {
        let x = path.split("."); x.pop(); let module = x.join(".");
        let y = nameWithExtension.split("."); y.pop(); let name = y.join(".");
		if (directoryName == name) return;
		if (directoryName != null) name = directoryName + " " + name;
		let {formalAction, messageAction} = require(module);
		commands[name] = {
			"formal":formalAction || null,
			"message":messageAction || null
		};
	}

	let filenames = fs.readdirSync("./commands/");
	filenames.forEach(filename => {
		if (filename.endsWith(".js")) addCommand(`./commands/${filename}`, filename, null);
		else {
			let _filenames = fs.readdirSync(`./commands/${filename}/`);
			_filenames.forEach(_filename => {
				if (_filename.endsWith(".js")) addCommand(`./commands/${filename}/${_filename}`, _filename, filename);
				else console.log(`folder ./commands/${filename}/${_filename} is causing issues`)
			});
		}
	});
	return commands;
}) ();

// reply to formal commands
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	Object.keys(Commands).forEach(cmd => {
		if (interaction.commandName == cmd && Commands[interaction.commandName]["formal"] != null) { Commands[interaction.commandName]["formal"](interaction); return; }
		cmdArr = cmd.split(" ");
		if (cmdArr[0] != interaction.commandName) return;
		if (interaction.options.data[0].type != 1) return; 
		if (interaction.options.data[0].name == cmdArr[1]) Commands[cmd]["formal"](interaction);
	})
});

// reply to text commands
client.on('messageCreate', (message) => {
	if (!message.content.startsWith(prefix)) return;
	Object.keys(Commands).forEach((name) => {
		if (Commands[name]["message"] == null) return;
		if (!message.content.split(prefix).splice(1).join(prefix).startsWith(name)) return;
		Commands[name]["message"](message);
	});
});

client.once('ready', () => {

	// maybe remove the register commands later
//	require("./registerCommands")().then((e) => {
//		if (e) throw e;
		console.log('Bot up and running!');
//	})
});

client.login(token);