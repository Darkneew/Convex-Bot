// INITIALIZATION
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  Partials,
} = require("discord.js");
const config = require("./config.json");
const dbUtils = require("./utils/db");
const argUtils = require("./utils/arg");
const convexUtils = require("./utils/convex");
const commandUtils = require("./utils/command");
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
  partials: [Partials.Channel],
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    // REPLY TO FORMAL COMMANDS
    if (interaction.guild != null) dbUtils.getPrefix(interaction.guild.id);
    if (interaction.commandName == "help") {
      Commands[interaction.commandName].action(
        interaction,
        Object.assign(
          {},
          ...interaction.options.data.map((obj) => ({ [obj.name]: obj.value }))
        ),
        dbUtils,
        Commands
      );
      return;
    }
    let cmd = Commands[interaction.commandName];
    if (
      interaction.options.data.length > 0 &&
      interaction.options.data[0].type == 1
    )
      cmd = cmd[interaction.options.data[0].name];
    if (cmd == undefined) {
      interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.error))
            .setTitle("Error")
            .setDescription("Internal Error - Command not found"),
        ],
      });
      return;
    }
    dbUtils.addXP(interaction.user.id, cmd.xp);
    if (
      interaction.options.data.length > 0 &&
      interaction.options.data[0].type == 1
    ) {
      cmd.action(
        interaction,
        Object.assign(
          {},
          ...interaction.options.data[0].options.map((obj) => ({
            [obj.name]: obj.value,
          }))
        ),
        dbUtils
      );
    } else {
      cmd.action(
        interaction,
        Object.assign(
          {},
          ...interaction.options.data.map((obj) => ({ [obj.name]: obj.value }))
        ),
        dbUtils
      );
    }
  } else if (interaction.isModalSubmit()) {
    // REPLY TO MODALS
    let args = interaction.customId.split("|");
    if (args[0] == "#maketransaction" && args.length == 5) {
      convexUtils.makeTransactionWithPassword(dbUtils, interaction, args[1], args[2], args[3], args[4], interaction.fields.getTextInputValue("password"));
    } else if (Object.keys(Modals).includes(args[0])) {
      if (args[0] == "help") Modals[args[0]](interaction, dbUtils, args.splice(1), Commands);
      else Modals[args[0]](interaction, dbUtils, args.splice(1));
    } else
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.error))
            .setTitle("Error")
            .setDescription(
              `Internal error - ${args[0]} not recognized as a modal.`
            ),
        ],
      });
  } else if (interaction.isButton()) {
    // REPLY TO BUTTONS
    let args = interaction.customId.split("|");
    if (args[0] == "#getpassword") {
      let modal = new ModalBuilder()
        .setCustomId(args.splice(1).join("|"))
        .setTitle("Enter your password");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password")
            .setLabel("Password")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
    }
    else if (Object.keys(Buttons).includes(args[0])) {
      if (args[0] == "help") Buttons[args[0]](interaction, dbUtils, args.splice(1), Commands);
      else Buttons[args[0]](interaction, dbUtils, args.splice(1));
    } else
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.error))
            .setTitle("Error")
            .setDescription(
              `Internal error - ${args[0]} not recognized as a button.`
            ),
        ],
      });
  }
});

client.on("messageCreate", async (message) => {
  let prefix = "";
  if (message.guild != null) {
    prefix = dbUtils.getPrefix(message.guildId);
  }
  // REPLY TO MENTIONS
  if (
    message.content.split(" ").length == 1 &&
    message.mentions.users.first() == client.user
  ) {
    let embed = new EmbedBuilder()
      .setColor(config.colors.convex)
      .setTitle("Hi")
      .setDescription(
        "Use my help command (/help) to get some help whenever you feel lost!"
      );
    if (prefix != "")
      embed.addFields({
        name: "Prefix",
        value: `The prefix for this server is ${prefix}. If you don't want to use discord commands for some reason, you can simply type the command as a message while starting it with ${prefix}.`,
      });
    message.channel.send({ embeds: [embed] });
  }
  if (prefix != "" && !message.content.startsWith(prefix)) return;
  // REPLY TO TEXT COMMANDS
  let text = message.content;
  if (prefix != null)
    text = text.split("").splice(prefix.length).join("").split(" ");
    if (text[0] == "help") {
      let arg = await argUtils.process(text.splice(1), Commands[text[0]].args, message);
      Commands[text[0]].action(
        message,
        arg,
        dbUtils,
        Commands
      );
      return;
    }
  let toSplice = 1; 
  let cmd = Commands[text[0]];
  if (!cmd) return;
  cmd = cmd[text[1]];
  if (cmd) toSplice = 2;
  else cmd = Commands[text[0]];
  if (Object.keys(cmd).includes("onlyInteraction") && cmd["onlyInteraction"]) {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setTitle("Please use the slash command.")
          .setDescription(
            "You cannot use this command from a text message. Please use the slash equivalent of this command to use it (replace the prefix by a slash, and select it from the dropdown menu that will appear)."
          ),
      ],
    });
    return;
  }
  if (Object.keys(cmd).includes("adminCommand") && cmd["adminCommand"] && !config.botModerators.includes(message.author.id)) {
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setTitle("Permission insufficiant")
          .setDescription(
            "This command can only be used by bot administrators. If you believe you should be able to run this command, please contact the host"
          ),
      ],
    });
    return;
  }
  let arg = await argUtils.process(text.splice(toSplice), cmd.args, message);
  if (!arg) return;
  dbUtils.addXP(message.author.id, cmd.xp);
  cmd.action(message, arg, dbUtils);
});

// When ready
client.once("ready", () => {
  console.log("Bot up and running");
});

// STOP THE BOT
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
process.on("exit", () => {
  dbUtils.db.close();
  console.log("Database closed");
  console.log("Bot down");
});

// START THE BOT
let args = process.argv.splice(2);
if ((args.includes("--init") || args.includes("-i")) && fs.existsSync("./database.db")) fs.unlinkSync("./database.db");
if (args.includes("--init") || args.includes("-i") || args.includes("--reset-commands") || args.includes("-rc")) commandUtils.register();
dbUtils.openDb();
if (args.includes("--init") || args.includes("-i")) dbUtils.init();
dbUtils.prepareStatements();
const { Commands, Buttons, Modals } = commandUtils.get();
client.login(config.token);
