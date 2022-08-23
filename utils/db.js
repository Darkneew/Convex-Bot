const config = require("../config.json");
const Database = require("better-sqlite3");

// OPENING DATABASE
module.exports.openDb = () => {
  module.exports.db = new Database("./database.db");
  console.log("Database opened");
}

// INIT DATABASE
module.exports.init = () => {
  let db = module.exports.db;
  db.prepare(
    `
    CREATE TABLE users (
      id TEXT PRIMARY KEY CHECK(id >= 0),
      address INTEGER UNIQUE CHECK(address >= -1) DEFAULT -1,
      xp INTEGER CHECK(xp >= 0) DEFAULT 0,
      interkey TEXT CHECK(length(interkey) = 64),
      publickey TEXT CHECK(length(publickey) = 64),
      is_anonym INTEGER CHECK(is_anonym = TRUE OR is_anonym = FALSE) DEFAULT FALSE,
      open_dm INTEGER CHECK(open_dm = TRUE OR open_dm = FALSE) DEFAULT TRUE,
      description TEXT DEFAULT '',
      password TEXT,
      session_end DATE
    ) WITHOUT ROWID
  `
  ).run(); 
  db.prepare(
    `
    CREATE TABLE tickets (
      tag TEXT CHECK(tag IN ('${config.ticketTags.join("','")}')),
      name TEXT CHECK(length(name)>0),
      description TEXT DEFAULT '',
      status TEXT CHECK(status IN ('${config.ticketStatuses.join(
        "','"
      )}')) DEFAULT ${config.ticketStatuses[0]},
      author TEXT CHECK(author >= 0),
      timestamp DATE NOT NULL
    )
    `
  ).run(); 
  db.prepare(
    `
    CREATE TABLE servers (
      id TEXT PRIMARY KEY CHECK(id >= 0),
      prefix TEXT DEFAULT '${config.defaultPrefix}',
      address INTEGER CHECK(address >= 0),
      token_price INTEGER CHECK(token_price >= 0)
    ) WITHOUT ROWID
    `
  ).run(); 
  db.prepare(
    `
    CREATE TABLE servermarket (
      type TEXT CHECK(type IN ('${config.types.servermarket.join(
        "', '"
      )}')),
      name TEXT CHECK(length(name)>0),
      price INTEGER CHECK(price>=0),
      server TEXT CHECK(server>=0),
      stock INTEGER CHECK(stock>=0),
      can_sell INTEGER CHECK(can_sell = TRUE OR can_sell = FALSE) DEFAULT TRUE
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE posts (
      type TEXT CHECK(type IN ('${config.types.post.join(
        "', '"
      )}')),
      title TEXT CHECK(length(title) > 0),
      description TEXT CHECK(length(title) > 0),
      author TEXT CHECK(author >= 0),
      timestamp DATE NOT NULL
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE fixedmarket (
      author TEXT CHECK(author >= 0),
      id_sell INTEGER CHECK(id_sell > 0),
      id_buy INTEGER CHECK(id_buy > 0),
      type_sell TEXT CHECK(type_sell IN ('${config.types.asset.join(
        "', '"
      )}')),
      type_buy TEXT CHECK(type_buy IN ('${config.types.asset.join(
        "', '"
      )}')),
      quantity_sell INTEGER CHECK(quantity_sell > 0),
      quantity_buy INTEGER CHECK(quantity_buy >= 0)
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE contracts (
      contractor1 TEXT CHECK(contractor1 >= 0),
      contractor2 TEXT CHECK(contractor2 >= 0),
      id1 INTEGER CHECK(id1 > 0),
      id2 INTEGER CHECK(id2 > 0),
      type1 TEXT CHECK(type1 IN ('${config.types.asset.join(
        "', '"
      )}')),
      type2 TEXT CHECK(type2 IN ('${config.types.asset.join(
        "', '"
      )}')),
      quantity1 INTEGER CHECK(quantity1 > 0),
      quantity2 INTEGER CHECK(quantity2 >= 0),
      contractid INTEGER CHECK(contractid >= 0)
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE notifications (
      timestamp DATE NOT NULL,
      name TEXT CHECK(length(name) > 0),
      message TEXT DEFAULT '',
      user TEXT CHECK(user >= 0),
      type TEXT CHECK(type IN ('${config.types.notification.join(
        "', '"
      )}'))
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE admins (
      server TEXT CHECK(server >= 0),
      member TEXT CHECK(member >= 0)
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE trophies (
      id INTEGER CHECK(id >= 0) PRIMARY KEY,
      name TEXT CHECK(length(name) > 0),
      guild TEXT CHECK(guild >= 0)
    ) WITHOUT ROWID
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE aliases (
      user TEXT CHECK(user >= 0),
      name TEXT CHECK(length(name) > 0),
      id INTEGER CHECK(id >= 0),
      quantity INTEGER CHECK(quantity >= 0),
      type TEXT CHECK(type IN ('${config.types.asset.join(
        "', '"
      )}'))
    )
    `
  ).run();
  db.prepare(
    `
    CREATE TABLE tasks (
      title TEXT CHECK(length(title) > 0),
      description TEXT NOT NULL,
      permanent INTEGER CHECK(permanent = TRUE OR permanent = FALSE) DEFAULT FALSE,
      guild TEXT CHECK(guild >= 0)
    )
    `
  ).run();
  console.log("Database initialized");
};

// STATEMENTS
module.exports.prepareStatements = () => {
  let db = module.exports.db;
  module.exports.userInit = db.prepare("INSERT INTO users(id) VALUES(?)");
  module.exports.guildInit = db.prepare("INSERT INTO servers(id) VALUES(?)");
  module.exports.getUserXP = db.prepare("SELECT xp FROM users WHERE id=?").pluck(true);
  module.exports.getGuildPrefix = db.prepare("SELECT prefix FROM servers WHERE id=?").pluck(true);
  module.exports.setUserXP = db.prepare("UPDATE users SET xp=? WHERE id=?");
  module.exports.getUserAddress = db.prepare("SELECT address FROM users WHERE id=?").pluck(true);
  module.exports.getUserAccount = db.prepare("SELECT address, interkey, publickey FROM users WHERE id=?");
  module.exports.setUserAccount = db.prepare("UPDATE users SET address=?, interkey=?, publickey=? WHERE id=?");
  module.exports.createTicket = db.prepare("INSERT INTO tickets(tag, name, description, author, timestamp) VALUES(?, ?, ?, ?, ?)");
}

module.exports.addXP = (id, amount) => {
  let xp = module.exports.getUserXP.get(id);
  if (xp == undefined) {
    module.exports.userInit.run(id);
    xp = 0;
  }
  module.exports.setUserXP.run(xp + amount, id);
};

module.exports.getXP = (id) => {
  let xp = module.exports.getUserXP.get(id);
  if (xp == undefined) {
    module.exports.userInit.run(id);
    xp = 0;
  }
  return xp;
}

module.exports.getPrefix = (id) => {
  let prefix = module.exports.getGuildPrefix.get(id);
  if (prefix == undefined) {
    module.exports.guildInit.run(id);
    prefix = config.defaultPrefix;
  }
  return prefix;
};
