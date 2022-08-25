# Convex Bot

Convex Bot is an implementation of Convex's functionalities and uses inside Discord.

Ever wanted to create your own financial system, to be able to transact freely within discord, to create, sell and buy assets as you want? This bot is made for you!

## Summary

## What is Convex?

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

Below is a list of the modules there is, with a list of every command in each module. `asset` argument represents the following sequence of argument: `[fungible|non-fungible] id quantity`

#### profile

This module allows you to check and modify your profile.

- `notifications [list|set]`
- `session [set|view]`
- `level` - done
- `anonymous [true|false]`
- `dm [open|close]`
- `view user?`
- `description [set|view]`
- `discuss user`
- `alias [set|list|remove]`

#### wallet

This module gives you the most basic Convex functions, allowing you to manage your wallet and create assets.

- `balance` - done
- `reset-password`
- `address user?` - done
- `account [create|change]` - done
- `transfer` - done
- `asset [create|list|transfer]`
- `memory [buy|sell] quantity` - done
- https://www.youtube.com/watch?v=2a40mRkcuag everything this supports

#### market

This module allows you to freely exchange assets, in the different markets that exists.

- `auction [sell|bid|list]`
- `fixed [sell|buy|list]`
- `post [create|list|details|reply]`
- `contract [create|list|accept]`

#### server

This module allow you to create an economy directly inside your server. Create your own currency, and use access to certain channels, roles, trophies and hierarchy inside the server as tradable assets.

- `set-prefix`
- `coins [create|give]`
- `admins [add|remove|list]`
- `guildmarket [add|buy|list]`
- `trophy [list|transfer|create] user`
- `tasks [create|list|complete|validate]`

#### ticket

This module manages tickets. Absolutely do not hesitate to make a ticket if you have an issue/find a bug. If you want to make a more general comment or want to improve the bot, check the advanced section.

- `create` - done
- `change-status`
- `open-discussion`
- `solve`
- `list`

#### advanced

This module is destined for those who (want to) know more about Convex, or want to participate in Convex's community.

- `feedback` - done
- `bot-invite` - done
- `link` - done
- `generate-key-pair` - done
- `execute`
- `discord-invite` - done
- `stop` - done

If at any moment you are lost, feel free to @ the bot.

### Running the bot in local

First of all, to run the bot locally, you need to have Node.js v16.16 or more, and npm v8.11 or more.

When this is done, simply follow these steps:

1.  Create your application [here](https://discord.com/developers/applications), and copy the client Id.
    1. If you want to give your application a description, name and profile picture, do it now.
2.  Build your bot in the bot section, and copy its token
3.  In OAuth2/URL Generator, create your link by choosing the bot and application.commands scopes, and the administrator permissions.
4.  Using the link, add your new bot to your server
5.  Download this code
6.  In the root directory, run `npm install`. This should install all dependencies
8.  Fill in the token and clientId values of `config.json`, and modify other values as you like. Do note that some of these values cannot be changed after doing step 9. Redoing step 9 would apply the new config but reset the database.
9.  Run `node index.js --init` to initialize everything

Your bot should at this point be running. In order to run it afterwards, you just have to do `npm start`!

## Bot internal system

### Database

The bot uses a sqlite3 database, containing the following tables:

#### users

|  id  | address |   xp    | interkey | publickey | is_anonym | description | open_dm | password | session_end |
| :--: | :-----: | :-----: | :------: | :-------: | :-------: | :---------: | :-----: | :------: | :---------: |
| TEXT | INTEGER | INTEGER |   TEXT   |   TEXT    |  INTEGER  |    TEXT     | INTEGER |   TEXT   |    DATE     |

#### ticket

| tag  | name | description | status | author |  rowid  | timestamp |
| :--: | :--: | :---------: | :----: | :----: | :-----: | :-------: |
| TEXT | TEXT |    TEXT     |  TEXT  |  TEXT  | INTEGER |   DATE    |

#### servers

|  id  | prefix | address | token_price |
| :--: | :----: | :-----: | :---------: |
| TEXT | STRING | INTEGER |   INTEGER   |

#### servermarket

| type  | name |  price  | server |  stock  | can_sell |  rowid  |
| :---: | :--: | :-----: | :----: | :-----: | :------: | :-----: |
| VALUE | TEXT | INTEGER |  TEXT  | INTEGER | INTEGER  | INTEGER |

#### posts

| type | title | description | author | timestamp |  rowid  |
| :--: | :---: | :---------: | :----: | :-------: | :-----: |
| TEXT | TEXT  |    TEXT     |  TEXT  |   DATE    | INTEGER |

#### fixedmarket

|  rowid  | author | id_sell | id_buy  | type_sell | type_buy | quantity_sell | quantity_buy |
| :-----: | :----: | :-----: | :-----: | :-------: | :------: | :-----------: | :----------: |
| INTEGER |  TEXT  | INTEGER | INTEGER |   TEXT    |   TEXT   |    INTEGER    |   INTEGER    |

#### contracts

|  rowid  | contractor1 | contractor2 |   id1   |   id2   | type1 | type2 | quantity1 | quantity2 | contractid |
| :-----: | :---------: | :---------: | :-----: | :-----: | :---: | :---: | :-------: | :-------: | :--------: |
| INTEGER |    TEXT     |    TEXT     | INTEGER | INTEGER | TEXT  | TEXT  |  INTEGER  |  INTEGER  |  INTEGER   |

#### notifications

|  rowid  | timestamp | name | message | user | type |
| :-----: | :-------: | :--: | :-----: | :--: | :--: |
| INTEGER |   DATE    | TEXT |  TEXT   | TEXT | TEXT |

#### admins

| server | member |  rowid  |
| :----: | :----: | :-----: |
|  TEXT  |  TEXT  | INTEGER |

#### trophies

|   id    | name | guild |
| :-----: | :--: | :---: |
| INTEGER | TEXT | TEXT  |

#### aliases

|  rowid  | user | name |   id    | quantity | type |
| :-----: | :--: | :--: | :-----: | :------: | :--: |
| INTEGER | TEXT | TEXT | INTEGER | INTEGER  | TEXT |

#### tasks

|  rowid  | title | description | permanent | guild |
| :-----: | :---: | :---------: | :-------: | :---: |
| INTEGER | TEXT  |    TEXT     |  INTEGER  | TEXT  |

## Contribution

This project is fully open source and open to any contribution. Feel free to make pull requests and create issues if you want!
