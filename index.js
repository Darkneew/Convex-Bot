const prefix = "$"

// Initialization
const fs = require("fs");
const sqlite = require("sqlite3");
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// to clean after finishing everything
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents] });
/*
// Getting commands
const Commands = (() => {
	let commands = {};

	let addCommand = (path, nameWithExtension) => {
        let x = path.split("."); x.pop(); let module = x.join(".");
        let y = nameWithExtension.split("."); y.pop(); let name = y.join(".");
		let {formalAction, messageAction} = require(module);
		commands[name] = {
			"formal":formalAction || null,
			"message":messageAction || null
		};
	}

	let filenames = fs.readdirSync("./commands/");
	filenames.forEach(filename => {
		if (filename.endsWith(".js")) addCommand(`./commands/${filename}`, filename);
		else {
			let _filenames = fs.readdirSync(`./commands/${filename}/`);
			_filenames.forEach(_filename => {
				if (_filename.endsWith(".js")) addCommand(`./commands/${filename}/${_filename}`, _filename);
				else console.log(`folder ./commands/${filename}/${_filename} is causing issues`)
			});
		}
	});
	
	return commands;
}) ();

// reply to formal commands
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (Commands[interaction.commandName]["formal"] == null) return;
	Commands[interaction.commandName]["formal"](interaction);
});

// reply to text commands
client.on('messageCreate', (message) => {
	console.log(message);
	if (!message.content.startsWith(prefix)) return;
	Object.keys(Commands).forEach((name) => {
		if (Commands[name]["message"] == null) return;
		if (!message.content.split(prefix).splice(1).join(prefix).startsWith(name)) return;
		Commands[name]["message"](message);
	});
});*/

client.once('ready', () => {
	require("./registerCommands")();
	console.log('Bot up and running!');
});

client.login(token);