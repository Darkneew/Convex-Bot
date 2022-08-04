module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the memory allowance of",
        "required": false
    }
];
module.exports.description = "Check your memory allowance"
module.exports.formalAction = (interaction) => {
    interaction.reply("you have 1 memory! (jk)");
}
module.exports.messageAction = (message) => {
    message.channel.send("you have 1 memory! (jk)");
}