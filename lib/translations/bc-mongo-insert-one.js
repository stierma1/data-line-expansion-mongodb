
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "bc-mongo-insert-one");
}

module.exports = function(args, dataSources){
  var name = args.name;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var dataSource = dataSources.get(args.key);

  var source = dataSource.map(function(doc){
    if(doc === null || doc === undefined){
      return Promise.resolve(null);
    }

    var prom = MongoWrapper.connectToMongo(connectString)
      .then(function(db){
        return MongoWrapper.insertOne(db, collectionName, doc);
      })
      .then(function(){
        return doc;
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
  var collectionName = await prompt("Input collection this will be inserting:\n");

  return {
    name:name,
    key:fromSource,
    connectionString:connectionString,
    collectionName: collectionName
  }

}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("bc-mongo-insert-one", module.exports);
}
