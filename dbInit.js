const sqlite = require("sqlite3");
const config = require("./config.json");

let db = new sqlite.Database('./database.db', (err) => {
    if (err) {
        console.log("Getting error " + err);
        exit(1);
    }
    db.serialize(() => {
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY CHECK(id >= 0),
                address INTEGER UNIQUE CHECK(address >= 0),
                xp INTEGER CHECK(xp >= 0) DEFAULT 0,
                interkey TEXT CHECK(length(interkey) = 64),
                publickey TEXT UNIQUE CHECK(length(publickey) = 32),
                is-anonym INTEGER CHECK(is-anonym = TRUE OR is-anonym = FALSE) DEFAULT FALSE,
                open-dm INTEGER CHECK(open-dm = TRUE OR open-dm = FALSE) DEFAULT TRUE,
                description TEXT DEFAULT ""
            ) [WITHOUT ROWID];

            CREATE TABLE tickets (
                tag TEXT CHECK(tag IN (${config.ticketTags.join(", ")})) NOT NULL,
                name TEXT NOT NULL CHECK(length(name)>0),
                description TEXT DEFAULT "",
                status TEXT CHECK(tag IN (${config.ticketStatuses.join(", ")})) NOT NULL,
                author INTEGER CHECK(id >= 0) NOT NULL
            );

            CREATE TABLE guilds (
                id INTEGER PRIMARY KEY CHECK(id >= 0),
                prefix TEXT DEFAULT "$",
                address INTEGER CHECK(address >= 0),
                token-price INTEGER CHECK(token-price >= 0),
            ) [WITHOUT ROWID];

            CREATE TABLE guildmarket (
                type TEXT CHECK(tag IN (${config.types.guildmarket.join(", ")})) NOT NULL,
                name TEXT NOT NULL CHECK(length(name)>0),
                guild INTEGER NOT NULL CHECK(guild>=0),
                price INTEGER CHECK(price>=0),
                stock INTEGER CHECK(stock>=0),
                can-sell INTEGER CHECK(can-sell = TRUE OR can-sell = FALSE) DEFAULT TRUE
            );
        `);
    })
});