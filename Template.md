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
 module.exports.args = [ // a list of all arguments needed
    {
        "name": "name_of_the_arg", // should be in one word, all lower case
        "type":"String", // or Boolean, Number, Integer, Channel, User, Role
        "description":"Short description of the parameter",
        "details":"Detailed description of the parameter",
        "required": true, // or false, wether the parameter is required or not. Optional parameters should be put at the end of the list.
        "choices": [ // optional, if the parameter only has a limited number of values
            {
                "name":"name_of_the_option", // name given by the user
                "value":"value_of_the_option" // value given to the command
            } // ,... any number of options is possible
        ]
    } // , ... any number of argument is possible
];
module.exports.description = "A short description of the command";
module.exports.details = "A detailed description of the command";
module.exports.action = (eventObject, args, db) => { // eventObject is a message or an interaction, 
                                                      // args a dictionnary with args given, 
                                                      // and db a connection to the database
    // action to perform
    eventObject.reply(answer); // an answer is needed, even for a few words.
}
```
Commands can eventually be put inside module folders to put them into these modules. The name of the command should be in lower case