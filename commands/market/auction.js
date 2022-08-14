module.exports.args = [
    {
        "name": "asset",
        "type":"String",
        "description":"the asset you want to put on auction",
        "required": true
    },
    {
        "name": "minimum-bet",
        "type":"Integer",
        "description":"the minimum bet for the auction. Default set at 100 convex coins.",
        "required": false
    },    
    {
        "name": "time-limit",
        "type":"Integer",
        "description":"The time (in minutes) before the auction ends. Default is 30 minutes.",
        "required": false
    }
];
module.exports.description = "Auction one of your assets";
module.exports.xp = 10;
module.exports.action = (interaction, args, dbUtils) => {
    interaction.reply("auction made! (jk)");
}