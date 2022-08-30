# Templates

## Creating a module

Modules are constituted of a folder inside which will be put all commands of the module, and of a file inside the folder following this template:

```js
module.exports.description = "Description of the module in a few words";
module.exports.details = "Detailed description";
```

The file should be a javascript file, and both the file and the folder should be named after the module, all in lower case.

## Creating a command

Commands are javascript files following this template:

```js
module.exports.args = [
  // a list of all arguments needed
  {
    name: "name_of_the_arg", // should be in one word, all lower case
    type: "String", // or Boolean, Number, Integer, Channel, User, Role
    description: "Short description of the parameter",
    details: "Detailed description of the parameter",
    required: true, // or false, wether the parameter is required or not. Optional parameters should be put at the end of the list.
    choices: [
      // optional, if the parameter only has a limited number of values
      {
        name: "name_of_the_option", // name given by the user
        value: "value_of_the_option", // value given to the command
      }, // ,... any number of options is possible
    ],
  }, // , ... any number of argument is possible
];
module.exports.description = "A short description of the command";
module.exports.details = "A detailed description of the command";
module.exports.xp = 1; // number of xp gained from using this command
module.exports.onlyInteraction = true; // optionnal, default is false, true if the command can only be used through slash commands.
module.exports.adminCommand = true; // optionnal, default is false, true if the command can only be used by admins. Admin Command won't be registered as slash commands.
module.exports.action = (eventObject, args, dbUtils) => {
  // eventObject is a message or an interaction,
  // args a dictionnary with args given,
  // and db a connection to the database
  // action to perform
  eventObject.reply(answer); // an answer is needed, even for a few words.
};

module.exports.buttons = { // list of button actions: can be empty, but does need to exist
  "customButtonId": (interaction, dbUtils, args) => {
    // what should the button do
    interaction.reply(answer)
  }
};

module.exports.modals = { // list of modal actions: can be empty, but does need to exist
  "customModalId": (interaction, dbUtils, args) => {
    // what should the modal do
    interaction.reply(answer)
  }
};

module.exports.callbacks = { // list of callbacks: can be empty, but does need to exist
  "name": (interaction, dbUtils, arg) => {
    interaction.reply(answer)
  }
};
```

Commands can eventually be put inside module folders to put them into these modules. The name of the command should be in lower case

Callbacks are functions globally declared in index.js (inside Callbacks)
They are for exemple used as optional argument in the convexUtils.makeTransaction function (in which arg is the value returned by the CVM)

## Custom IDs

Custom IDs are used to identify modals as well as button. 

A custom ID must be lowercase, and without `|`.
To pass arguments through a custom Id, write your arguments after the usual custom Id separated by a `|` in the modal's or button's custom Id. Arguments passed like that will be given as an array in the 3rd argument of the function. 

Exemple 

```js
// extract from a code to create a button
new ButtonBuilder()
.setCustomId(`createticket|${data.tag}`)
.setLabel(`Create a ticket`)
.setStyle(ButtonStyle.Primary)

// then extract from the function which reply to this button
"createticket": (interaction, dbUtils, args) => {
  // some code goes in between
  interaction.reply(`A ticket was created, categorized as ${args[0]}`)
}
```

## Code in makeTransaction

The source given to makeTransaction has a limited size, due to the fact that customIds can't be more than 100 characters.

To solve this issue, code can be pre-declared in utils/lisp.js
Passing a string following this format: `µnameµarg1µarg2...` (where name is the name of the function in lisp.js, and arg1, arg2, etc.. are the arguments to give to the function) will make the value returned by the function execute instead of the source itself.

