module.exports.args = [
    {
        "name": "name",
        "type":"String",
        "description":"the name of the token you want to create.",
        "required": true
    },
    {
        "name": "stock",
        "type":"Integer",
        "description":"the starting stock for this token. You won't be able to make anymore of this token afterwards.",
        "required": true
    }
];
module.exports.description = "Create a token for the server";
module.exports.xp = 1;
module.exports.action = (eventObject, args, dbUtils) => {
    eventObject.reply("token made! (jk)");
}

module.exports.buttons = {};
module.exports.modals = {};