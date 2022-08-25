const config = require("../../config.json");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const cryptoUtils = require("../../utils/crypto");
const convexUtils = require("../../utils/convex");
const argUtils = require("../../utils/arg");

module.exports.args = [
  {
    name: "action",
    type: "String",
    description:
      "wether you want to create an account, change your account, or get your keys",
    details:
      "Choose 'create' to create a new account. If you already have an account linked but want to change, choose 'change'. Finally, choose 'get' to get your public key and interkey.",
    required: true,
    choices: [
      {
        name: "create",
        value: "create",
      },
      {
        name: "change",
        value: "change",
      },
      {
        name: "get",
        value: "get",
      },
    ],
  },
];
module.exports.description = "Manage your convex account";
module.exports.details =
  "Manage the convex account linked to your discord account: create one, change it or retrieve your keys. By choosing create or change, you will also be given the possibility of linking a convex account made outside of discord.";
module.exports.xp = 50;

const NewOrExistingQuestion = (eventObject) => {
  eventObject.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(
          "Do you want to create a new account, or do you want to register an already existing account?"
        )
        .setColor(config.colors.question)
        .setFooter({ text: "Convex", iconURL: config.links.logo })
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("newaccount")
          .setLabel("New account")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("existingaccount")
          .setLabel("Existing account")
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  });
};

module.exports.action = (eventObject, args, dbUtils) => {
  switch (args.action) {
    case "create":
      let a = dbUtils.getUserAddress.get(
        (eventObject.author || eventObject.user).id
      );
      if (a >= 0) {
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `You already have a convex account registered by me (#${a}). Do you still want to continue, and change acount?`
              )
              .setColor(config.colors.question)
              .setFooter({ text: "Convex", iconURL: config.links.logo }),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("NoEQ")
                .setLabel("Proceed")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      } else NewOrExistingQuestion(eventObject);
      break;
    case "change":
      let b = dbUtils.getUserAddress.get(
        (eventObject.author || eventObject.user).id
      );
      if (b == -1) {
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                `You don't have any convex account yet. Do you want to create your convex account??`
              )
              .setColor(config.colors.question)
              .setFooter({ text: "Convex", iconURL: config.links.logo }),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("NoEQ")
                .setLabel("Proceed")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
      } else NewOrExistingQuestion(eventObject);
      break;
    case "get":
      let account = dbUtils.getUserAccount.get(
        (eventObject.author || eventObject.user).id
      );
      if (account == undefined) {
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setTitle("Error")
              .setDescription(
                `Can't retreive your account: you don't have one.`
              ),
          ],
        });
      } else if (account.address == -1)
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(parseInt(config.colors.error))
              .setTitle("Error")
              .setDescription(
                `You haven't created your account yet. Please use \`profile account create\` to make one.`
              ),
          ],
        });
      else
        eventObject.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Your account:`)
              .setColor(config.colors.convex)
              .addFields([
                { name: "Address", value: `${account.address}` },
                { name: "Public key", value: `${account.publickey}` },
                { name: "Interkey", value: `${account.interkey}` },
              ])
              .setFooter({ text: "Convex", iconURL: config.links.logo }),
          ],
          ephemeral: true,
        });
      break;
    default:
      eventObject.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(parseInt(config.colors.error))
            .setTitle("Error")
            .setDescription(
              `Internal error - ${args.action} not recognized as an action.`
            ),
        ],
      });
      break;
  }
};

module.exports.buttons = {
  NoEQ: (interaction, dbUtils, args) => {
    NewOrExistingQuestion(interaction);
  },
  existingaccount: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Do you want to generate the interkey or let me do it?")
          .addFields({
            name: "Generate it",
            value:
              "If you want to generate your interkey yourself, you only have to download a small app to do it",
          })
          .addFields({
            name: "Let me do it",
            value:
              "If you let me do it, you will have to send your private key on discord",
          })
          .setColor(config.colors.question)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("NoEQ")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("enterkeyswithaccount")
            .setLabel("Generate it")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("generateinterkey")
            .setLabel("Let me do it")
            .setStyle(ButtonStyle.Secondary)
        ),
      ]
    });
  },
  newaccount: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(
            "Do you want me to create the account or do you want to create it yourself?"
          )
          .addFields({
            name: "Let me do it",
            value:
              "If you let me do it and want to retreive your private key, you will later either need me to send your private key on discord or download a small app to get it yourself.",
          })
          .addFields({
            name: "Create it yourself",
            value:
              "If you create your account yourself, you will need to download a small app to do it, but will immediatly be in possession of all your keys.",
          })
          .setColor(config.colors.question)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("NoEQ")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("createaccount")
            .setLabel("Let me do it")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("enterkeyswithoutaccount")
            .setLabel("Do it yourself")
            .setStyle(ButtonStyle.Secondary)
        ),
      ]
    });
  },
  enterkeyswithoutaccount: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Create your account")
          .setDescription(
            "To create your account, simply click on the `App` button, download the script and run it\nYou can find a manual and the source code (that you can compile yourself) by clicking on the `Manual and Code` button\n\nWhen you are done, click on `Next`"
          )
          .setColor(config.colors.convex)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("newaccount")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("existingaccount")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setURL(
              "https://drive.google.com/file/d/1akmy0MTzFOoi6ycGKsleW_dS8DV3iEq8/view?usp=sharing"
            )
            .setLabel("App")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL("https://github.com/Darkneew/AccountCreation")
            .setLabel("Manual and Code")
            .setStyle(ButtonStyle.Link)
        ),
      ]
    });
  },
  enterkeyswithaccount: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Generate your interkey")
          .setDescription(
            "To generate your interkey, you first need to think of a password. A long and original password is highly recommanded. All characters are authorized. Putting in words from different languages is advised.\n\nAfter, simply click on the `App` button, download the script and run it\nYou can find a manual and the source code (that you can compile yourself) by clicking on the `Manual and Code` button\n\nIf you have difficulties with the links, simply use the buttons below. Be sure to always remember your password. If you loose it, no one will be able to help you!\nWhen you are done, click on `Next` to get the form"
          )
          .setColor(config.colors.convex)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("existingaccount")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("filleverythingformaccount")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setURL(
              "https://drive.google.com/file/d/16uujXLUbXEJnfXCjOzeN0BYSUW81u2Yn/view?usp=sharing"
            )
            .setLabel("App")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL("https://github.com/Darkneew/InterkeyGenerator")
            .setLabel("Manual and Code")
            .setStyle(ButtonStyle.Link)
        ),
      ]
    });
  },
  createaccount: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Choose your password")
          .setDescription(
            "To create an account, you first need to think of a password. A long and original password is highly recommanded. All characters are authorized. Putting in words from different languages is advised."
          )
          .setColor(config.colors.convex)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("newaccount")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("choosepasswordaccount")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
        ),
      ]
    });
  },
  choosepasswordaccount: (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`createeverythingaccount`)
      .setTitle("Choose your password");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("password1")
          .setLabel("Password")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("password2")
          .setLabel("Password again (to make sure)")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  },
  filleverythingformaccount: (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`filleverythingmodalaccount`)
      .setTitle("Enter your account details");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("interkey1")
          .setLabel("Interkey")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("interkey2")
          .setLabel("Interkey again (to make sure)")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("publickey1")
          .setLabel("Public Key")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("publickey2")
          .setLabel("Public Key again (to make sure)")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("address1")
          .setLabel("Address")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  },
  generateinterkey: (interaction, dbUtils, args) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Choose your password")
          .setDescription(
            "To generate your interkey, you will need a password. A long and original password is highly recommanded. All characters are authorized. Putting in words from different languages is advised."
          )
          .setColor(config.colors.convex)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("existingaccount")
            .setLabel("Go back")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("getprivatekeyandpasswordaccount")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
        ),
      ]
    });
  },
  getprivatekeyandpasswordaccount: (interaction, dbUtils, args) => {
    let modal = new ModalBuilder()
      .setCustomId(`interkeymodalaccount`)
      .setTitle("Enter your private key and password");
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("address1")
          .setLabel("Address")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("privatekey1")
          .setLabel("Private Key")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("privatekey2")
          .setLabel("Private Key again (to make sure)")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("password1")
          .setLabel("Password")
          .setStyle(TextInputStyle.Short)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("password2")
          .setLabel("Password again (to make sure)")
          .setStyle(TextInputStyle.Short)
      )
    );
    interaction.showModal(modal);
  },
};

module.exports.modals = {
  filleverythingmodalaccount: (interaction, dbUtils, args) => {
    if (
      interaction.fields.getTextInputValue("interkey1") !=
      interaction.fields.getTextInputValue("interkey2")
    ) {
      let modal = new ModalBuilder()
        .setCustomId(`filleverythingmodalaccount`)
        .setTitle("The two interkeys must match.");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("interkey1")
            .setLabel("Interkey")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("interkey2")
            .setLabel("Interkey again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("publickey1")
            .setLabel("Public Key")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("publickey2")
            .setLabel("Public Key again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address1")
            .setLabel("Address")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
      return;
    }
    if (
      interaction.fields.getTextInputValue("publickey1") !=
      interaction.fields.getTextInputValue("publickey2")
    ) {
      let modal = new ModalBuilder()
        .setCustomId(`filleverythingmodalaccount`)
        .setTitle("The two Public Keys must match.");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("interkey1")
            .setLabel("Interkey")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("interkey2")
            .setLabel("Interkey again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("publickey1")
            .setLabel("Public Key")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("publickey2")
            .setLabel("Public Key again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address1")
            .setLabel("Address")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
      return;
    }
    if (
      !argUtils.checkInt(
        interaction.fields.getTextInputValue("address1"),
        interaction,
        "address"
      )
    )
      return;
    if (
      !argUtils.checkSize(
        interaction.fields.getTextInputValue("interkey1"),
        64,
        interaction,
        "interkey"
      )
    )
      return;
    if (
      !argUtils.checkSize(
        interaction.fields.getTextInputValue("publickey1"),
        64,
        interaction,
        "public key"
      )
    )
      return;
    dbUtils.setUserAccount.run(
      interaction.fields.getTextInputValue("address1"),
      interaction.fields.getTextInputValue("interkey1"),
      interaction.fields.getTextInputValue("publickey1"),
      interaction.user.id
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Your account was successfully registered!")
          .setColor(config.colors.success)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ]
    });
  },
  createeverythingaccount: async (interaction, dbUtils, args) => {
    if (
      interaction.fields.getTextInputValue("password1") !=
      interaction.fields.getTextInputValue("password2")
    ) {
      let modal = new ModalBuilder()
        .setCustomId(`createeverythingaccount`)
        .setTitle("The two passwords must match.");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password1")
            .setLabel("Password")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password2")
            .setLabel("Password again (to make sure)")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
      return;
    }
    let { address, privateKey } = await convexUtils.createAccount();
    let publicKey = await cryptoUtils.getPublicKey(privateKey);
    let interkey = cryptoUtils.generateInterkey(
      privateKey,
      interaction.fields.getTextInputValue("password1")
    );
    dbUtils.setUserAccount.run(
      address,
      interkey,
      publicKey,
      interaction.user.id
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Your account was successfully created!")
          .addFields({ name: "address", value: `${address}`, "inline?": true })
          .setColor(config.colors.success)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ]
    });
  },
  interkeymodalaccount: async (interaction, dbUtils, args) => {
    if (
      interaction.fields.getTextInputValue("privatekey1") !=
      interaction.fields.getTextInputValue("privatekey2")
    ) {
      let modal = new ModalBuilder()
        .setCustomId(`interkeymodalaccount`)
        .setTitle("The two Private Keys must match.");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address1")
            .setLabel("Address")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("privatekey1")
            .setLabel("Private Key")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("privatekey2")
            .setLabel("Private Key again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password1")
            .setLabel("Password")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password2")
            .setLabel("Password again (to make sure)")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
      return;
    }
    if (
      interaction.fields.getTextInputValue("password1") !=
      interaction.fields.getTextInputValue("password2")
    ) {
      let modal = new ModalBuilder()
        .setCustomId(`interkeymodalaccount`)
        .setTitle("The two passwords must match.");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("address1")
            .setLabel("Address")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("privatekey1")
            .setLabel("Private Key")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("privatekey2")
            .setLabel("Private Key again (to make sure)")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password1")
            .setLabel("Password")
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("password2")
            .setLabel("Password again (to make sure)")
            .setStyle(TextInputStyle.Short)
        )
      );
      interaction.showModal(modal);
      return;
    }
    if (
      !argUtils.checkInt(
        interaction.fields.getTextInputValue("address1"),
        interaction,
        "address"
      )
    )
      return;
    if (
      !argUtils.checkSize(
        interaction.fields.getTextInputValue("privatekey1"),
        64,
        interaction,
        "private key"
      )
    )
      return;
    let interkey = cryptoUtils.generateInterkey(
      interaction.fields.getTextInputValue("privatekey1"),
      interaction.fields.getTextInputValue("password1")
    );
    let publicKey = await cryptoUtils.getPublicKey(interaction.fields.getTextInputValue("privatekey1"));
    dbUtils.setUserAccount.run(
      interaction.fields.getTextInputValue("address1"),
      interkey,
      publicKey,
      interaction.user.id
    );
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Your account was successfully registered!")
          .setColor(config.colors.success)
          .setFooter({ text: "Convex", iconURL: config.links.logo }),
      ]
    });
  },
};
