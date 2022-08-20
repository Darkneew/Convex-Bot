module.exports.args = [
    {
        "name": "user",
        "type":"User",
        "description":"the user you want to check the memory allowance of",
        "required": false,
        "details":"If this argument is given, it will allow you to check someone else's memory allowance. An argument of type User is expected."
    }
];
module.exports.description = "Check your memory allowance";
module.exports.xp = 1;
module.exports.details = "Gives your or another user's memory allowance. Memory allowance is the amount of space you have left to use before needing to buy more. You can buy or sell memory allowance from there if no argument for user is given."
module.exports.action = (eventObject, args, dbUtils) => {
    if (Object.keys(args).includes("user")) eventObject.reply(`${args["user"].username} has 1 memory`);
    else eventObject.reply("you have 1 memory! (jk)");
    // todo
}

module.exports.buttons = {};
module.exports.modals = {};