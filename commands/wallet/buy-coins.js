module.exports.args = [
    {
        "name": "quantity",
        "type":"Integer",
        "description":"the number of coins you want to buy",
        "required": true,
        "details": "The number of coins you want to buy. An argument of type Integer is expected."
    }
];
module.exports.description = "Buy convex coins with an outer currency.";
module.exports.xp = 1;
module.exports.details = "Buy convex coins with an outer currency. Use wallet balance to check your balance of Convex coins."
module.exports.action = (eventObject, args, dbUtils) => {
    eventObject.reply(`bought ${quantity} convex coins!`);
    // todo
}

module.exports.buttons = {};
module.exports.modals = {};