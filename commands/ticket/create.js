module.exports.args = [
    {
        "name": "tag",
        "type":"String",
        "description":"The type of issue you are having",
        "required": true,
        "choices": (() => {
            let choices = [];
            require('../../config.json').ticketTags.forEach((v) => {
                choices.push({"name":v, "value":v})
            });
            return choices;
        }) ()
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
module.exports.description = "Create a ticket. Please do not abuse of this command.";
module.exports.xp = 1;
module.exports.action = (eventObject, args, dbUtils) => {
    eventObject.reply("ticket created! (jk)");
}