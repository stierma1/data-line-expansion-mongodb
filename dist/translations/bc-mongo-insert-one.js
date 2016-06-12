
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.key, args, "bc-mongo-insert-one");
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var dataSource = dataSources.get(args.key);

  var source = dataSource.map(function (doc) {
    if (doc === null || doc === undefined) {
      return Promise.resolve(null);
    }

    var prom = MongoWrapper.connectToMongo(connectString).then(function (db) {
      return MongoWrapper.insertOne(db, collectionName, doc);
    }).then(function () {
      return doc;
    });
    return prom;
  }).concatAll().publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, fromSource, connectionString, collectionName;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will you give this new instance?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("What source will this be applied to?\n"));

      case 5:
        fromSource = _context.sent;
        _context.next = 8;
        return regeneratorRuntime.awrap(prompt("Input connection string for mongodb:\n"));

      case 8:
        connectionString = _context.sent;
        _context.next = 11;
        return regeneratorRuntime.awrap(prompt("Input collection this will be inserting:\n"));

      case 11:
        collectionName = _context.sent;
        return _context.abrupt("return", {
          name: name,
          key: fromSource,
          connectionString: connectionString,
          collectionName: collectionName
        });

      case 13:
      case "end":
        return _context.stop();
    }
  }, null, this);
};

module.exports.initialize = function (dataSources) {
  dataSources.get("translations").set("bc-mongo-insert-one", module.exports);
};