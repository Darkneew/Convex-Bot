const config = require("../config.json");
const cryptoUtils = require("./crypto");
const axios = require("axios").create({ baseURL: config.convexUrl });
const utils = require("./misc");
const { EmbedBuilder } = require("discord.js");

const statusIsOk = (status, interaction) => {
  if (status == 500) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setFooter({ text: "Convex", iconURL: config.links.logo })
          .setTitle("Error")
          .setDescription(
            "Server encountered an error. Please retry after some time"
          ),
      ],
    });
    return false;
  } else if (status == 400) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setFooter({ text: "Convex", iconURL: config.links.logo })
          .setTitle("Error")
          .setDescription("Request was incorrectly formatted"),
      ],
    });
    return false;
  } else if (status == 403) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(parseInt(config.colors.error))
          .setFooter({ text: "Convex", iconURL: config.links.logo })
          .setTitle("Error")
          .setDescription("Wrong password"),
      ],
    });
    return false;
  }
  return true;
};

module.exports.createAccount = async (privateKey = null) => {
  if (!privateKey) privateKey = cryptoUtils.randomPrivateKey();
  let res = await axios.post("createAccount", {
    accountKey: await cryptoUtils.getPublicKey(privateKey),
  });
  return { address: res.data.address, privateKey: privateKey };
};

module.exports.getAccountDetails = async (address) => {
  return (await axios.get(`accounts/${address}`)).data;
};

module.exports.requestMoney = async (dbUtils, interaction, userid, amount) => {
  let address = utils.getAddress(dbUtils, userid, null, interaction, true);
  if (address == -1) return;
  axios
    .post("faucet", {
      address: address,
      amount: amount,
    })
    .then((res) => {
      if (Object.keys(res.data).includes("errorCode"))
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setFooter({ text: "Convex", iconURL: config.links.logo })
              .setTitle(`Error - ${res.data.errorCode}`)
              .setDescription(res.data.value),
          ],
        });
      else
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.success))
              .setFooter({ text: "Convex", iconURL: config.links.logo })
              .setTitle(`Successfully requested ${res.data.value} coins`),
          ],
        });
    })
    .catch((err) => {
      if (Object.keys(err).includes("response"))
        statusIsOk(err.response.status, interaction);
      else throw err;
    });
};

module.exports.makeTransaction = async (
  dbUtils,
  interaction,
  userid,
  source,
  message,
  verbose = false
) => {
  utils.getPassword(
    dbUtils,
    interaction,
    `#maketransaction|${userid}|${verbose}|${source
      .split(" ")
      .join("°")}|${message.split(" ").join("°")}`,
    userid,
    (pwd) => {
      this.makeTransactionWithPassword(
        dbUtils,
        interaction,
        userid,
        verbose,
        source.split(" ").join("°"),
        message.split(" ").join("°"),
        pwd
      );
    }
  );
};

module.exports.makeTransactionWithPassword = async (
  dbUtils,
  interaction,
  userid,
  verbose,
  rawsource,
  rawmessage,
  password,
  count = 10
) => {
  let source = rawsource.split("°").join(" ");
  let message = rawmessage.split("°").join(" ");
  let account = dbUtils.getUserAccount.get(userid);
  axios
    .post("transaction/prepare", {
      address: account.address,
      source: source,
    })
    .then(async (res) => {
      let privateKey = cryptoUtils.getPrivateKey(account.interkey, password);
      if (privateKey == null) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setFooter({ text: "Convex", iconURL: config.links.logo })
              .setTitle(`Error - Wrong password`),
          ],
        });
        return;
      }
      let sig = await cryptoUtils.sign(privateKey, res.data.hash);
      axios
        .post("transaction/submit", {
          accountKey: account.publickey,
          address: account.address,
          hash: res.data.hash,
          sig: sig,
        })
        .then((_res) => {
          if (Object.keys(_res.data).includes("errorCode")) {
            if (_res.data.errorCode == "SEQUENCE") {
              if (count > 0)
                this.makeTransactionWithPassword(
                  dbUtils,
                  interaction,
                  userid,
                  verbose,
                  rawsource,
                  rawmessage,
                  password,
                  count - 1
                );
              else
                interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(parseInt(config.colors.error))
                      .setFooter({ text: "Convex", iconURL: config.links.logo })
                      .setTitle(`Error - SEQUENCE`)
                      .setDescription(
                        "There was an error with the network. Please try again in a few moments"
                      ),
                  ],
                });
            } else
              interaction.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(parseInt(config.colors.error))
                    .setFooter({ text: "Convex", iconURL: config.links.logo })
                    .setTitle(`Error - ${_res.data.errorCode}`)
                    .setDescription(_res.data.value),
                ],
              });
          } else {
            let embed = new EmbedBuilder()
              .setColor(parseInt(config.colors.success))
              .setFooter({ text: "Convex", iconURL: config.links.logo })
              .setTitle(`${message} executed successfully`);
            if (verbose == "true")
              embed.addFields({ name: "return value", value: _res.data.value });
            interaction.reply({ embeds: [embed] });
          }
        })
        .catch((err) => {
          if (Object.keys(err).includes("response"))
            statusIsOk(err.response.status, interaction);
          else throw err;
        });
    })
    .catch((err) => {
      if (Object.keys(err).includes("response"))
        statusIsOk(err.response.status, interaction);
      else throw err;
    });
};
