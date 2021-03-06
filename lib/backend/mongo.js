// Generated by CoffeeScript 1.6.3
(function() {
  var MongoBackend, mongodb, q, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  q = require('q');

  _ = require('lodash');

  mongodb = require('mongodb');

  MongoBackend = (function() {
    function MongoBackend(url) {
      this.setObjectMetadata = __bind(this.setObjectMetadata, this);
      this.getObjects = __bind(this.getObjects, this);
      this.getObject = __bind(this.getObject, this);
      this.deleteObject = __bind(this.deleteObject, this);
      this.setObjectLastModified = __bind(this.setObjectLastModified, this);
      this.addObject = __bind(this.addObject, this);
      this.containerDeleteObject = __bind(this.containerDeleteObject, this);
      this.containerAddObject = __bind(this.containerAddObject, this);
      this.setContainerAcl = __bind(this.setContainerAcl, this);
      this.setContainerMetadata = __bind(this.setContainerMetadata, this);
      this.getContainers = __bind(this.getContainers, this);
      this.getContainer = __bind(this.getContainer, this);
      this.setContainerLastModified = __bind(this.setContainerLastModified, this);
      this.deleteContainer = __bind(this.deleteContainer, this);
      this.addContainer = __bind(this.addContainer, this);
      this.getAuthTokenAccount = __bind(this.getAuthTokenAccount, this);
      this.addAuthToken = __bind(this.addAuthToken, this);
      this.getUser = __bind(this.getUser, this);
      this.addUser = __bind(this.addUser, this);
      this.accountDeleteObject = __bind(this.accountDeleteObject, this);
      this.accountAddObject = __bind(this.accountAddObject, this);
      this.accountDeleteContainer = __bind(this.accountDeleteContainer, this);
      this.accountAddContainer = __bind(this.accountAddContainer, this);
      this.setAccountMetadata = __bind(this.setAccountMetadata, this);
      this.getAccount = __bind(this.getAccount, this);
      this.setAccountLastModified = __bind(this.setAccountLastModified, this);
      this.addAccount = __bind(this.addAccount, this);
      this.close = __bind(this.close, this);
      this.connect = __bind(this.connect, this);
      this.databaseUrl = url || 'mongodb://localhost/lightswift';
    }

    MongoBackend.prototype.connect = function() {
      var collections,
        _this = this;
      collections = [
        ['accounts', []], [
          'users', [
            {
              "_id.a": 1,
              "_id.u": 1
            }
          ]
        ], ['authTokens', []], [
          'containers', [
            {
              "_id.a": 1
            }, {
              "_id.a": 1,
              "_id.c": 1
            }
          ]
        ], [
          'objects', [
            {
              "_id.a": 1,
              "_id.c": 1
            }, {
              "_id.a": 1,
              "_id.c": 1,
              "_id.o": 1
            }
          ]
        ]
      ];
      return q.ninvoke(mongodb, 'connect', this.databaseUrl).then(function(db) {
        var allCollections;
        _this.db = db;
        allCollections = collections.map(function(_arg) {
          var indices, name;
          name = _arg[0], indices = _arg[1];
          return q.ninvoke(db, 'collection', name).then(function(col) {
            _this[name] = col;
            return q.all(indices.map(function(index) {
              return q.ninvoke(col, 'ensureIndex', index);
            }));
          });
        });
        return q.all(allCollections);
      });
    };

    MongoBackend.prototype.close = function() {
      if (this.db == null) {
        return q();
      }
      return q.ninvoke(this.db, 'close');
    };

    MongoBackend.prototype.addAccount = function(account, accountInfo) {
      accountInfo._id = account;
      return q.ninvoke(this.accounts, 'save', accountInfo);
    };

    MongoBackend.prototype.setAccountLastModified = function(account, lastModified) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $set: {
          lastModified: lastModified
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.getAccount = function(account) {
      var qry,
        _this = this;
      qry = {
        _id: account
      };
      return q.ninvoke(this.accounts, 'findOne', qry).then(function(a) {
        if (a != null) {
          delete a._id;
        }
        return a;
      });
    };

    MongoBackend.prototype.setAccountMetadata = function(account, metadata) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $set: {
          metadata: metadata
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.accountAddContainer = function(account) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $inc: {
          containerCount: 1
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.accountDeleteContainer = function(account) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $inc: {
          containerCount: -1
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.accountAddObject = function(account, size) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $inc: {
          objectCount: 1,
          bytesUsed: size
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.accountDeleteObject = function(account, size) {
      var data, qry;
      qry = {
        _id: account
      };
      data = {
        $inc: {
          objectCount: -1,
          bytesUsed: -size
        }
      };
      return q.ninvoke(this.accounts, 'update', qry, data);
    };

    MongoBackend.prototype.addUser = function(account, username, key) {
      var user;
      user = {
        _id: {
          a: account,
          u: username
        },
        key: key
      };
      return q.ninvoke(this.users, 'save', user);
    };

    MongoBackend.prototype.getUser = function(account, username) {
      var qry;
      qry = {
        _id: {
          a: account,
          u: username
        }
      };
      return q.ninvoke(this.users, 'findOne', qry);
    };

    MongoBackend.prototype.addAuthToken = function(account, authToken) {
      var data;
      data = {
        _id: authToken,
        account: account
      };
      return q.ninvoke(this.authTokens, 'save', data);
    };

    MongoBackend.prototype.getAuthTokenAccount = function(authToken) {
      var qry;
      qry = {
        _id: authToken
      };
      return q.ninvoke(this.authTokens, 'findOne', qry).then(function(data) {
        return data != null ? data.account : void 0;
      });
    };

    MongoBackend.prototype.addContainer = function(account, container, containerInfo) {
      containerInfo._id = {
        a: account,
        c: container
      };
      return q.ninvoke(this.containers, 'save', containerInfo);
    };

    MongoBackend.prototype.deleteContainer = function(account, container) {
      var qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      return q.ninvoke(this.containers, 'remove', qry);
    };

    MongoBackend.prototype.setContainerLastModified = function(account, container, lastModified) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      data = {
        $set: {
          lastModified: lastModified
        }
      };
      return q.ninvoke(this.containers, 'update', qry, data);
    };

    MongoBackend.prototype.getContainer = function(account, container) {
      var qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      return q.ninvoke(this.containers, 'findOne', qry).then(function(c) {
        if (c != null) {
          delete c._id;
        }
        return c;
      });
    };

    MongoBackend.prototype.getContainers = function(account) {
      var cur, qry,
        _this = this;
      qry = {
        '_id.a': account
      };
      cur = this.containers.find(qry);
      return q.ninvoke(cur, 'toArray').then(function(res) {
        return _(res).map(function(x) {
          return [x._id.c, x];
        }).map(function(_arg) {
          var k, v;
          k = _arg[0], v = _arg[1];
          delete v._id;
          return [k, v];
        }).object().value();
      });
    };

    MongoBackend.prototype.setContainerMetadata = function(account, container, metadata) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      data = {
        $set: {
          metadata: metadata
        }
      };
      return q.ninvoke(this.containers, 'update', qry, data);
    };

    MongoBackend.prototype.setContainerAcl = function(account, container, acl) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      data = {
        $set: {
          acl: acl
        }
      };
      return q.ninvoke(this.containers, 'update', qry, data);
    };

    MongoBackend.prototype.containerAddObject = function(account, container, size) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      data = {
        $inc: {
          objectCount: 1,
          bytesUsed: size
        }
      };
      return q.ninvoke(this.containers, 'update', qry, data);
    };

    MongoBackend.prototype.containerDeleteObject = function(account, container, size) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container
        }
      };
      data = {
        $inc: {
          objectCount: -1,
          bytesUsed: -size
        }
      };
      return q.ninvoke(this.containers, 'update', qry, data);
    };

    MongoBackend.prototype.addObject = function(account, container, object, obj) {
      obj._id = {
        a: account,
        c: container,
        o: object
      };
      return q.ninvoke(this.objects, 'save', obj);
    };

    MongoBackend.prototype.setObjectLastModified = function(account, container, object, lastModified) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container,
          o: object
        }
      };
      data = {
        $set: {
          lastModified: lastModified
        }
      };
      return q.ninvoke(this.objects, 'update', qry, data);
    };

    MongoBackend.prototype.deleteObject = function(account, container, object) {
      var _this = this;
      return this.getObject(account, container, object).then(function(obj) {
        var qry;
        qry = {
          _id: {
            a: account,
            c: container,
            o: object
          }
        };
        return q.ninvoke(_this.objects, 'remove', qry).then(function() {
          return obj;
        });
      });
    };

    MongoBackend.prototype.getObject = function(account, container, object) {
      var qry;
      qry = {
        _id: {
          a: account,
          c: container,
          o: object
        }
      };
      return q.ninvoke(this.objects, 'findOne', qry).then(function(o) {
        if (o != null) {
          delete o._id;
        }
        return o;
      });
    };

    MongoBackend.prototype.getObjects = function(account, container) {
      var cur, qry,
        _this = this;
      qry = {
        '_id.a': account,
        '_id.c': container
      };
      cur = this.objects.find(qry);
      return q.ninvoke(cur, 'toArray').then(function(res) {
        return _(res).map(function(x) {
          return [x._id.o, x];
        }).map(function(_arg) {
          var k, v;
          k = _arg[0], v = _arg[1];
          delete v._id;
          return [k, v];
        }).object().value();
      });
    };

    MongoBackend.prototype.setObjectMetadata = function(account, container, object, metadata) {
      var data, qry;
      qry = {
        _id: {
          a: account,
          c: container,
          o: object
        }
      };
      data = {
        $set: {
          metadata: metadata
        }
      };
      return q.ninvoke(this.objects, 'update', qry, data);
    };

    return MongoBackend;

  })();

  module.exports = MongoBackend;

}).call(this);
