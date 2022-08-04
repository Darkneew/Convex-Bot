module.exports.args = [
    {
        "name": "publickey",
        "type":"String",
        "description":"your public key",
        "required": false
    },
    {
        "name": "interkey",
        "type":"String",
        "description":"your interkey",
        "required": false
    }
];
module.exports.description = "Create your convex account";
module.exports.formalAction = (interaction) => {
    interaction.reply("done! (jk)");
}
module.exports.messageAction = (message) => {
    message.channel.send("done! (jk)");
}