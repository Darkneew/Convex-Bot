const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

module.exports.args = [
  {
    name: "user",
    type: "User",
    description: "the user you want to check the level of",
    required: false,
    details:
      "If this argument is given, it will allow you to check someone else's level. An argument of type User is expected.",
  },
];
module.exports.description = "Check your level";
module.exports.xp = 1;
module.exports.details =
  "Gives your or another user's level. Use this bot to increase your level.";

const reply = (user, eventObject, dbUtils, pronoun) => {
  let xp = dbUtils.getXP(user.id);
  let level = 0;
  if (xp > 1) level = Math.floor(Math.log2(xp));
  eventObject.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${pronoun} level is ${level}`)
        .setColor(config.colors.convex)
        .setDescription(`with a total of ${xp} xp`)
        .setThumbnail(user.avatarURL())
        .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
    ],
  });
};

module.exports.action = (eventObject, args, dbUtils) => {
  let author = eventObject.author || eventObject.user;
  if (Object.keys(args).includes("user") && author.id != args["user"])
    eventObject.guild.members.fetch(args.user).then((member) => {
      reply(member.user, eventObject, dbUtils, member.user.username);
    });
  else reply(author, eventObject, dbUtils, "Your");
};

module.exports.buttons = {};
module.exports.modals = {};
