var Mongodb = require("mongodb");

module.exports.findAll = function(db, collectionName, query, projection){
    return new Promise(function(res, rej){
      var collection = db.collection(collectionName);

      if(!collection){
        rej(new Error(`Collection "${collectionName}" was not found`));
        return;
      }

      collection.find(query || {}, projection || {}, function(err, cursor){
        if(err){
          rej(err);
          return;
        }

        cursor.toArray(function(err2, docs){
            if(err2){
              rej(err);
              return;
            }

            res(docs);
        });
      })
    })
}

module.exports.findOne = function(db, collectionName, query, projection){
  return new Promise(function(res, rej){
    var collection = db.collection(collectionName);

    if(!collection){
      rej(new Error(`Collection "${collectionName}" was not found`));
      return;
    }

    collection.findOne(query || {}, projection || {}, function(err, doc){
      if(err){
        rej(err);
        return;
      }

      res(doc);
    });
  });
}

module.exports.findCursor = function(db, collectionName, query, projection){
    return new Promise(function(res, rej){
      var collection = db.collection(collectionName);

      if(!collection){
        rej(new Error(`Collection "${collectionName}" was not found`));
        return;
      }

      collection.find(query || {}, projection || {}, function(err, cursor){
        if(err){
          rej(err);
          return;
        }

        res(cursor);
      });
    });
}

module.exports.insertMany = function(db, collectionName, docs){
  return new Promise(function(res, rej){
    var collection = db.collection(collectionName);

    if(!collection){
      rej(new Error(`Collection "${collectionName}" was not found`));
      return;
    }

    collection.insert(docs, function(err){
      if(err){
        rej(err);
        return;
      }

      res();
    });
  });
}

module.exports.insertOne = function(db, collectionName, doc){
  return new Promise(function(res, rej){
    var collection = db.collection(collectionName);

    if(!collection){
      rej(new Error(`Collection "${collectionName}" was not found`));
      return;
    }

    collection.insert([doc], function(err){
      if(err){
        rej(err);
        return;
      }

      res();
    });
  });
}

module.exports.upsertOne = function(db, collectionName, doc, selector){
  return new Promise(function(res, rej){
    var collection = db.collection(collectionName);

    if(!collection){
      rej(new Error(`Collection "${collectionName}" was not found`));
      return;
    }

    collection.update(selector || {}, doc, true, function(err){
      if(err){
        rej(err);
        return;
      }

      res();
    });
  });
}

module.exports.connectToMongo = function(connectionString){
  return new Promise(function(res, rej){
    Mongodb.connect(connectionString, function(err, db){
      if(err){
        rej(err);
        return;
      }

      res(db);
    });
  });
}
