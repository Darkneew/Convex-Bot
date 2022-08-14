module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the balance of",
        "required": false,
        "details": "If this argument is given, it will allow you to check someone else's balance. An argument of type User is expected."
    }
];
module.exports.description = "Check your balance of Convex coins";
module.exports.xp = 1;
module.exports.details = "Gives your or another user's balance of Convex coins. Use wallet buy-coins to buy more Convex coins with outer currencies."
module.exports.action = (interaction, args, dbUtils) => {
    interaction.guild.members.fetch()
    if (Object.keys(args).includes("user")) {
        interaction.guild.members.fetch(args["user"]).then((member) => {
            interaction.reply(`${member.user.username} has 1 cc`);
        });
    }
    else interaction.reply("you have 1 cc! (jk)");
    // todo
}