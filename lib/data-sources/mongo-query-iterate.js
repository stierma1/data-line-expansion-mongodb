
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "mongo-query-iterate");
}

function bumpCursor(cursor, onNext, onCompleted){
    var prom = new Promise(function(res, rej){
      cursor.hasNext(function(err, value){
        if(err){
          rej(err);
          return;
        }
        if(!value){
          cursor.close();
          onCompleted();
          res(null);
          return;
        }
        cursor.next(function(err, doc){
          if(err){
            rej(err);
            return;
          }
          onNext(doc);
          res(doc);
        });
      });
    });

    prom.then(function(doc){
      if(doc !== null){
        return bumpCursor(cursor, onNext, onCompleted);
      }
    });
}

module.exports = function(args, dataSources){
  var name = args.name;
  var query = args.query;
  var projection = args.projection;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var source = RX.Observable.create(function(observer){
    MongoWrapper.connectToMongo(connectString)
      .then(function(db){
        return MongoWrapper.findCursor(db, collectionName, query, projection)
      })
      .then(function(_cursor){
        bumpCursor(_cursor, observer.onNext.bind(observer), observer.onCompleted.bind(observer))
      });
  })
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var connectionString = await prompt("Input connection string for mongodb:\n");
  var collectionName = await prompt("Input collection this will be querying:\n");
  var query;
  try{
    query = JSON.parse(await prompt("Input query: (expects Json, no input will find all docs in collection)\n"));
  } catch(err){
    query = undefined;
  }
  var projection;
  try{
    projection = JSON.parse(await prompt("Input projection: (expects Json, no input will not filter any docs in collection)\n"));
  } catch(err){
    projection = undefined;
  }

  return {
    name:name,
    connectionString:connectionString,
    collectionName: collectionName,
    query:query,
    projection:projection
  }

}
