
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "bc-mongo-query-iterate");
}

function bumpCursor(cursor){
    return new Promise(function(res, rej){
      cursor.hasNext(function(err, value){
        if(err){
          rej(err);
          return;
        }
        if(!value){
          cursor.close();
          res(null);
          return;
        }
        cursor.next(function(err, doc){
          if(err){
            rej(err);
            return;
          }
          res(doc);
        });
      });
    });
}

module.exports = function(args, dataSources){
  var name = args.name;
  var query = args.query;
  var projection = args.projection;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var dataSource = dataSources.get(args.key);
  var cursor = null;

  var source = dataSource.map(function(){
    if(cursor){
      return bumpCursor(cursor);
    }

    var prom = MongoWrapper.connectToMongo(connectString)
      .then(function(db){
        return MongoWrapper.findCursor(db, collectionName, query, projection)
      })
      .then(function(_cursor){
        cursor = _cursor;
        return bumpCursor(cursor);
      });
    return prom;
  })
  .concatAll()
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var fromSource = await prompt("What source will this be applied to?\n");
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
    key:fromSource,
    connectionString:connectionString,
    collectionName: collectionName,
    query:query,
    projection:projection
  }

}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("bc-mongo-query-iterate", module.exports);
}
