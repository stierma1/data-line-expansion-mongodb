
//require("babel-polyfill")
var Rx = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "bc-mongo-swallow-error");
}

module.exports = function(args, dataSources){
  var name = args.name;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var dataSource = dataSources.get(args.key);

  var failSentinel = {};
  var source = dataSource.map(function(val){
      if(val instanceof Rx.Observable){
        return val.catch(function(val){
          return Rx.Observable.return({d:val, f:failSentinel});
        });
      } else {
        return Rx.Observable.return({d:val, f:false});
      }
  })
  .selectMany(function(val){
    return val;
  })
  .where(function(data){
    if(!(!data.f || data.f !== failSentinel)){
      MongoWrapper.connectToMongo(connectString)
        .then(function(db){
          var errorData = data.d
          try{
            errorData = JSON.stringify(data.d, null, 2);
          } catch(e){

          }
          return MongoWrapper.insertOne(db, collectionName, {name:args.name, time:Date.now(), error:errorData});
        });
    }
    return !data.f || data.f !== failSentinel;
  })
  .map(function(data){
    return data.d;
  }).publish().refCount();

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
  };
}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("bc-mongo-swallow-error", module.exports);
}
