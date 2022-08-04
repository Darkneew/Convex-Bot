module.exports.args = [
    {
        "name": "tag",
        "type":"String",
        "description":"The type of issue you are having",
        "required": true,
        "choices":[
            { "name": "wallet", "value": "wallet"},
            { "name": "ticket", "value": "ticket"},
            { "name": "community", "value": "community"},
            { "name": "server", "value": "server"},
            { "name": "other", "value": "other"},
        ]
    }, 
    {
        "name": "issue",
        "type":"String",
        "description":"Quick description of your issue (in a few words)",
        "required": true
    },   
    {
        "name": "description",
        "type":"String",
        "description":"Description of the issue",
        "required": true
    },
    {
        "name": "file",
        "type":"Attachment",
        "description":"Files that can help understand or resolve the issue. If you have multiple files, zip them together.",
        "required": false
    }
];
module.exports.description = "Create a ticket. Please do not abuse of this command."
module.exports.formalAction = (interaction) => {
    interaction.reply("ticket created! (jk)");
}
module.exports.messageAction = (message) => {
    message.channel.send("ticket created! (jk)");
}