
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.key, args, "mongo-query-iterate-destroy");
}

function bumpCursor(cursor, onNext, onCompleted, db, collectionName) {
  var prom = new Promise(function (res, rej) {
    cursor.hasNext(function (err, value) {
      if (err) {
        rej(err);
        return;
      }
      if (!value) {
        cursor.close();
        onCompleted();
        res(null);
        return;
      }
      cursor.next(function (err, doc) {
        if (err) {
          rej(err);
          return;
        }

        if (doc) {
          db.collection(collectionName).remove({ _id: doc._id }, { justOne: true }, function (err) {
            onNext(doc);
            res(doc);
          });
        } else {
          onNext(doc);
          res(doc);
        }
      });
    });
  });

  prom.then(function (doc) {
    if (doc !== null) {
      return bumpCursor(cursor, onNext, onCompleted, db, collectionName);
    }
  });
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var query = args.query;
  var projection = args.projection;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var source = RX.Observable.create(function (observer) {
    var _db = null;
    MongoWrapper.connectToMongo(connectString).then(function (db) {
      _db = db;
      return MongoWrapper.findCursor(db, collectionName, query, projection);
    }).then(function (_cursor) {
      bumpCursor(_cursor, observer.onNext.bind(observer), observer.onCompleted.bind(observer), _db, collectionName);
    });
  }).publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, connectionString, collectionName, query, projection;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will you give this new instance?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("Input connection string for mongodb:\n"));

      case 5:
        connectionString = _context.sent;
        _context.next = 8;
        return regeneratorRuntime.awrap(prompt("Input collection this will be querying:\n"));

      case 8:
        collectionName = _context.sent;
        _context.prev = 9;
        _context.t0 = JSON;
        _context.next = 13;
        return regeneratorRuntime.awrap(prompt("Input query: (expects Json, no input will find all docs in collection)\n"));

      case 13:
        _context.t1 = _context.sent;
        query = _context.t0.parse.call(_context.t0, _context.t1);
        _context.next = 20;
        break;

      case 17:
        _context.prev = 17;
        _context.t2 = _context["catch"](9);

        query = undefined;

      case 20:
        _context.prev = 20;
        _context.t3 = JSON;
        _context.next = 24;
        return regeneratorRuntime.awrap(prompt("Input projection: (expects Json, no input will not filter any docs in collection)\n"));

      case 24:
        _context.t4 = _context.sent;
        projection = _context.t3.parse.call(_context.t3, _context.t4);
        _context.next = 31;
        break;

      case 28:
        _context.prev = 28;
        _context.t5 = _context["catch"](20);

        projection = undefined;

      case 31:
        return _context.abrupt("return", {
          name: name,
          connectionString: connectionString,
          collectionName: collectionName,
          query: query,
          projection: projection
        });

      case 32:
      case "end":
        return _context.stop();
    }
  }, null, this, [[9, 17], [20, 28]]);
};