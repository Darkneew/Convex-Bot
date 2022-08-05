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
                isanonymous INTEGER CHECK(isanonymous = TRUE OR isanonymous = FALSE) DEFAULT FALSE,
                opendm INTEGER CHECK(isanonymous = TRUE OR isanonymous = FALSE) DEFAULT TRUE,
                description TEXT DEFAULT ""
            ) [WITHOUT ROWID];

            CREATE TABLE tickets (
                tag TEXT CHECK(tag IN (${config.ticketTags.join(", ")})) NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                author INTEGER NOT NULL,
                status TEXT CHECK(tag IN (${config.ticketStatuses.join(", ")})) NOT NULL,
                author INTEGER CHECK(id >= 0) NOT NULL
            );

            CREATE TABLE guilds (
                id INTEGER PRIMARY KEY CHECK(id >= 0),
                prefix TEXT DEFAULT "$",
                address INTEGER CHECK(address >= 0),
                tokenprice INTEGER CHECK(tokenprice >= 0),
            ) [WITHOUT ROWID];

            CREATE TABLE guildmarket (
                type TEXT CHECK(tag IN (${config.guildMarketTypes.join(", ")})) NOT NULL,
                value TEXT NOT NULL,
                guild INTEGER NOT NULL
            );
        `);
    })
});