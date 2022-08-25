const config = require("../config.json");
const {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports.getPassword = (dbUtils, interaction, customId, userId, callback) => {
  let pwd = dbUtils.getPassword.get(userId);
  if (pwd != undefined) {callback(pwd); return;}
  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("You need to enter your password")
        .setColor(config.colors.convex)
        .setFooter({ text: "Convex", iconURL: config.links.ressources.logo }),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`#getpassword|${customId}`)
          .setLabel("Enter password")
          .setStyle(ButtonStyle.Primary)
      ),
    ],
    ephemeral: true
  },);
};

module.exports.getAddress = (dbUtils, userid, username, eventObject, isUser = false) => {
  let add = dbUtils.getUserAddress.get(userid);
  if (add == undefined || add == -1) {
    let embed = new EmbedBuilder()
      .setColor(parseInt(config.colors.error))
      .setFooter({ text: "Convex", iconURL: config.links.ressources.logo })
      .setTitle("Error");
    if (isUser)
      embed.setDescription(
        `You don't have any convex account registered yet. Use \`profile account create\` to create one.`
      );
    else
      embed.setDescription(
        `${username} doesn't have any convex account registered yet`
      );
    eventObject.reply({ embeds: [embed] });
    return -1;
  }
  return add;
};
