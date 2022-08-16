const { EmbedBuilder } = require('discord.js');
const config = require("./config.json");
const parse = async (type, string, guild) => {
    switch (type) {
        case "String":
            return string;
        case "Integer":
            if (isNaN(string)) return null;
            else return parseInt(string);
        case "Number":
            if (isNaN(string)) return null;
            else return parseFloat(string);
        case "Boolean":
            if (string.toLowerCase().startsWith("f")) return false;
            else if (string.toLowerCase().startsWith("t")) return true;
            else return null;
        case "User":
            if (string.startsWith("<@") && string.endsWith(">")) {
                let id = string.split("").splice(2);
                id.pop();
                id = id.join("");
                if (isNaN(id)) return null;
                try {
                    await guild.members.fetch(id);
                    return id;
                } catch (e) {
                    return null;
                }
            } else return null;
        case "Role":
            if (string.startsWith("<@&") && string.endsWith(">")) {
                let id = string.split("").splice(3);
                id.pop();
                id = id.join("");
                if (isNaN(id)) return null;
                try {
                    let id = await guild.roles.fetch(id);
                    return id;
                } catch {
                    return null;
                }
            } else return null;
        case "Channel":
            if (string.startsWith("<#") && string.endsWith(">")) {
                let id = string.split("").splice(2);
                id.pop();
                id = id.join("");
                if (isNaN(id)) return null;
                try {
                    let id = await guild.channels.fetch(id);
                    return id;
                } catch {
                    return null;
                }
            } else return null;
        default:
            return undefined;
    }
}

module.exports.process = async (argsGiven, argsFormat, interaction) => {
    let args = {};
    let i = 0;
    if (argsFormat.length < argsGiven.length) {
        interaction.channel.send({ embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setTitle("Error")
              .setDescription(`Too much arguments were given. A maximum of ${argsFormat.length} arguments were expected.`)
        ]});
        return null;
    }
    while (i < argsGiven.length) {
        if (interaction.guild == null && ["User", "Channel", "Role"].includes(argsFormat[i].type)) {
            interaction.channel.send({ embeds: [
                new EmbedBuilder()
                  .setColor(parseInt(config.colors.error))
                  .setTitle("Error")
                  .setDescription(`Cannot recognize mentions in a DM.`)
            ]});
            return null;
        }
        let arg = await parse(argsFormat[i].type, argsGiven[i], interaction.guild);
        if (arg === undefined) {
            interaction.channel.send({ embeds: [
                new EmbedBuilder()
                  .setColor(parseInt(config.colors.error))
                  .setTitle("Error")
                  .setDescription(`"An unexpected error happened server-side. ${argsFormat[i].type} is an unknown datatype.`)
            ]});
            return null;
        }
        if (arg === null) {
            interaction.channel.send({ embeds: [
                new EmbedBuilder()
                  .setColor(parseInt(config.colors.error))
                  .setTitle("Error")
                  .setDescription(`"${argsGiven[i]}" was given for parameter ${argsFormat[i].name}. An argument of type ${argsFormat[i].type} was expected.`)
            ]});
            return null;
        }
        if (Object.keys(argsFormat[i]).includes("choices")) {
            let isInChoices = false;
            argsFormat[i].choices.forEach(choice => {
                if (arg == choice.name) {
                    isInChoices = true;
                    arg = choice.value;
                }
            });
            if (!isInChoices) {
                argsFormat[i].choices.forEach(choice => {
                    if (arg == choice.value) {
                        isInChoices = true;
                    }
                });
            }
            if (!isInChoices) {
                interaction.channel.send({ embeds: [
                    new EmbedBuilder()
                      .setColor(parseInt(config.colors.error))
                      .setTitle("Error")
                      .setDescription(`"${argsGiven[i]}" was given for parameter ${argsFormat[i].name}. It is not among the choices possible.\n\nThe choices are ${argsFormat[i].choices.map((x) => x.name).join(", ")}`)
                ]});
                return null;
            }
        }
        args[argsFormat[i].name] = arg;
        i++;
    }
    if (i < argsFormat.length && argsFormat[i].required) {
        interaction.channel.send({ embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setTitle("Error")
              .setDescription(`Not argument was given for parameter ${argsFormat[i].name}. This argument is mandatory.`)
        ]});
        return null;
    }
    return args;
}