module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the level of",
        "required": false,
        "details": "If this argument is given, it will allow you to check someone else's level. An argument of type User is expected."
    }
];
module.exports.description = "Check your level";
module.exports.details = "Gives your or another user's level. Use this bot to increase your level."
module.exports.action = (interaction, args) => {
    if (Object.keys(args).includes("user")) interaction.reply(`${args["user"].username} has 1 level`);
    else interaction.reply("you have 1 level! (jk)");
    // todo
}