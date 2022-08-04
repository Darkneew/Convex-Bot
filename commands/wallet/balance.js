module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the balance of",
        "required": false
    }
];
module.exports.description = "Check your balance of Convex coins"
module.exports.formalAction = (interaction) => {
    interaction.reply("you have 1 cc! (jk)");
}
module.exports.messageAction = (message) => {
    message.channel.send("you have 1 cc! (jk)");
}