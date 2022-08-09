module.exports = async () => {
  const sqlite = require("sqlite3");
  const config = require("./config.json");
  let db = new sqlite.Database("./database.db", (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    db.serialize(() => {
      db.exec(
        `
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY CHECK(id >= 0),
                    address INTEGER UNIQUE CHECK(address >= 0),
                    xp INTEGER CHECK(xp >= 0) DEFAULT 0,
                    interkey TEXT CHECK(length(interkey) = 64),
                    publickey TEXT UNIQUE CHECK(length(publickey) = 32),
                    is_anonym INTEGER CHECK(is_anonym = TRUE OR is_anonym = FALSE) DEFAULT FALSE,
                    open_dm INTEGER CHECK(open_dm = TRUE OR open_dm = FALSE) DEFAULT TRUE,
                    description TEXT DEFAULT "",
                    password TEXT NOT NULL,
                    session_end DATE NOT NULL
                ) WITHOUT ROWID;

                CREATE TABLE tickets (
                    tag TEXT CHECK(tag IN ("${config.ticketTags.join('","')}")),
                    name TEXT CHECK(length(name)>0),
                    description TEXT DEFAULT "",
                    status TEXT CHECK(status IN ("${config.ticketStatuses.join(
                      '","'
                    )}")),
                    author INTEGER CHECK(author >= 0),
                    timestamp DATE NOT NULL
                );

                CREATE TABLE servers (
                    id INTEGER PRIMARY KEY CHECK(id >= 0),
                    prefix TEXT DEFAULT "$",
                    address INTEGER CHECK(address >= 0),
                    token_price INTEGER CHECK(token_price >= 0)
                ) WITHOUT ROWID;

                CREATE TABLE servermarket (
                    type TEXT CHECK(type IN ("${config.types.servermarket.join(
                      '", "'
                    )}")),
                    name TEXT CHECK(length(name)>0),
                    price INTEGER CHECK(price>=0),
                    server INTEGER CHECK(server>=0),
                    stock INTEGER CHECK(stock>=0),
                    can_sell INTEGER CHECK(can_sell = TRUE OR can_sell = FALSE) DEFAULT TRUE
                );
                CREATE TABLE posts (
                    type TEXT CHECK(type IN ("${config.types.post.join(
                      '", "'
                    )}")),
                    title TEXT CHECK(length(title) > 0),
                    description TEXT CHECK(length(title) > 0),
                    author INTEGER CHECK(author >= 0),
                    timestamp DATE NOT NULL
                );
                CREATE TABLE fixedmarket (
                    author INTEGER CHECK(author >= 0),
                    id_sell INTEGER CHECK(id_sell > 0),
                    id_buy INTEGER CHECK(id_buy > 0),
                    type_sell TEXT CHECK(type_sell IN ("${config.types.asset.join(
                      '", "'
                    )}")),
                    type_buy TEXT CHECK(type_buy IN ("${config.types.asset.join(
                      '", "'
                    )}")),
                    quantity_sell INTEGER CHECK(quantity_sell > 0),
                    quantity_buy INTEGER CHECK(quantity_buy >= 0)
                );

                CREATE TABLE contracts (
                    contractor1 INTEGER CHECK(contractor1 >= 0),
                    contractor2 INTEGER CHECK(contractor2 >= 0),
                    id1 INTEGER CHECK(id1 > 0),
                    id2 INTEGER CHECK(id2 > 0),
                    type1 TEXT CHECK(type1 IN ("${config.types.asset.join(
                      '", "'
                    )}")),
                    type2 TEXT CHECK(type2 IN ("${config.types.asset.join(
                      '", "'
                    )}")),
                    quantity1 INTEGER CHECK(quantity1 > 0),
                    quantity2 INTEGER CHECK(quantity2 >= 0),
                    contractid INTEGER CHECK(contractid >= 0)
                );

                CREATE TABLE notifications (
                    timestamp DATE NOT NULL,
                    name TEXT CHECK(length(name) > 0),
                    message TEXT DEFAULT "",
                    user INTEGER CHECK(user >= 0),
                    type TEXT CHECK(type IN ("${config.types.notification.join(
                      '", "'
                    )}"))
                );

                CREATE TABLE admins (
                    server INTEGER CHECK(server >= 0),
                    member INTEGER CHECK(member >= 0)
                );

                CREATE TABLE trophies (
                    id INTEGER CHECK(id >= 0) PRIMARY KEY,
                    name TEXT CHECK(length(name) > 0),
                    guild INTEGER CHECK(guild >= 0)
                ) WITHOUT ROWID;

                CREATE TABLE aliases (
                    user INTEGER CHECK(user >= 0),
                    name TEXT CHECK(length(name) > 0),
                    id INTEGER CHECK(id >= 0),
                    quantity INTEGER CHECK(quantity >= 0),
                    type TEXT CHECK(type IN ("${config.types.asset.join(
                      '", "'
                    )}"))
                );

                CREATE TABLE tasks (
                    title TEXT CHECK(length(title) > 0),
                    description TEXT NOT NULL,
                    permanent INTEGER CHECK(permanent = TRUE OR permanent = FALSE) DEFAULT FALSE,
                    guild INTEGER CHECK(guild >= 0)
                );
            `,
        () => console.log("Database initialized!")
      );
    });
  });
};
