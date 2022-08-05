# Convex Bot

Convex Bot is an implementation of Convex's functionalities and uses inside Discord.

Ever wanted to create your own financial system, to be able to transact freely within discord, to create, sell and buy assets as you want? This bot is made for you!

---

## But what is Convex?

Convex is the next generation of blockchain technology, with web-scale performance, flexibility and energy efficiency.

It is an open source, non-profit foundation enabling new decentralised ecosystems in finance, gaming virtual worlds and the enterprise.

To read more and dive into Convex's world, follow this [link](https://www.convex.world)

## How to use the bot?

### Adding the bot to your server

To add the bot to your server, simply follow [this link](https://discord.com/api/oauth2/authorize?client_id=1004552872811302952&permissions=8&scope=bot%20applications.commands).

/!\ You must have admin permissions on your server in ordrer to add it.

### Commands

Convex Bot is made out of several modules, each containing commands for the specific module. 
To run a command, either type `/module-name command-name arg1 ...`, or type `[prefix]module-name command-name arg1 ...`. The default prefix is $, but can be changed by a server manager for a server.

To get help, simply type `/help` or `[prefix]help`.

Here is a list of the modules there is:

####

If at any moment you are lost, feel free to @ the bot. 

### Running the bot in local

First of all, to run the bot locally, you need to have Node.js v16.16 or more, and npm v8.11 or more.

When this is done, simply follow these steps:
 1. Create your application [here](https://discord.com/developers/applications), and copy the client Id.
    1. If you want to give your application a description, name and profile picture, do it now.
 2. Build your bot in the bot section, and copy its token
 3. In OAuth2/URL Generator, create your link by choosing the bot and application.commands scopes, and the administrator permissions.
 4. Using the link, add your new bot to your server
 5. Download this code
 6. In the root directory, run `npm install`. This should install all dependencies
 7. Create a config.json file following this format :
```json
{
    "token": "your bot token",
    "clientId": "your client Id",
    "ticketTags": [
        "wallet",
        "ticket",
        "community",
        "server",
        "other"
    ],
    "ticketStatuses": [
        "submitted", 
        "in process", 
        "solved"
    ],
    "guildMarketTypes": [
        "role",
        "NFT"
    ],
    "marketTypes": [
        "NFT",
        "Fungible token"
    ]
}
```
 8. Fill in the token and clientId values
 9. Run `node registerCommands.js`
 10. Run `node dbInit.js`
 
Your bot is finally ready to run. In order to run it, you now just have to do `npm start`!

## Contribution

This porject is fully open source and open to any contribution. Feel free to make pull requests and create issues if you want!
