module.exports = {
  adminlogin: function(data, callback) {
    if (data.password) {
      data.password = sails.md5(data.password);
      sails.query(function(err, db) {
        if (db) {
          db.collection('user').find({
            email: data.email,
            password: data.password,
            accesslevel: "moderator"
          }, {
            password: 0,
            forgotpassword: 0
          }).toArray(function(err, found) {
            if (err) {
              callback({
                value: false
              });
              console.log(err);
              db.close();
            } else if (found && found[0]) {
              callback(found[0]);
              db.close();
            } else {
              callback({
                value: false,
                comment: "No data found"
              });
              db.close();
            }
          });
        }
        if (err) {
          console.log(err);
          callback({
            value: false
          });
        }
      });
    } else {
      callback({
        value: false
      });
    }
  },
  save: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        if (!data._id) {
          data._id = sails.ObjectID();
          data.approved = 0;
          if (!data.accesslevel)
            data.accesslevel = "user";
          db.collection('user').insert(data, function(err, created) {
            if (err) {
              console.log(err);
              callback({
                value: false,
                comment: "Error"
              });
              db.close();
            } else if (created) {
              callback({
                value: true,
                id: data._id
              });
              db.close();
            } else {
              callback({
                value: false,
                comment: "Not created"
              });
              db.close();
            }
          });
        } else {
          var user = sails.ObjectID(data._id);
          delete data._id;
          db.collection('user').update({
            _id: user
          }, {
            $set: data
          }, function(err, updated) {
            if (err) {
              console.log(err);
              callback({
                value: false,
                comment: "Error"
              });
              db.close();
            } else if (updated.result.nModified != 0 && updated.result.n != 0) {
              callback({
                value: true
              });
              db.close();
            } else if (updated.result.nModified == 0 && updated.result.n != 0) {
              callback({
                value: true,
                comment: "Data already updated"
              });
              db.close();
            } else {
              callback({
                value: false,
                comment: "No data found"
              });
              db.close();
            }
          });
        }
      }
    });
  },
  find: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find().toArray(function(err, found) {
          if (err) {
            callback({
              value: false
            });
            db.close();
          } else if (found && found[0]) {
            callback(found);
            db.close();
          } else {
            callback({
              value: false,
              comment: "No data found"
            });
            db.close();
          }
        });
      }
    });
  },

  generateCashflow: function(data, cashflow) {
    var pos;

    cashflow.push(data.lumpsum); //step 1
    var i = 0;

    for (i = 1; i < (data.startMonth + data.noOfInstallment + 1); i++) {
      if (i <= data.noOfMonth) {
        cashflow.push(data.monthly);
      } else if (i > data.startMonth) {
        cashflow.push(-1 * Math.round(data.installment * (Math.pow(((100 + data.inflation) / 100), (i / 12)))));
      } else {
        cashflow.push(0);
      }
    }
    return true;
  },

  alltypes: function(data, callback) {


    var cashflow = [];
    User.generateCashflow(data, cashflow);
    var nocallback = 0;
    var type = 0;
    var alltypes = [];

    function onReturn(resp) {
      if (resp) {
        nocallback++;
        alltypes.push(resp);
      }
      if (nocallback == 11) {
        callCallback();
      }
    }

    for (var i = 0; i <= 10; i++) {
      data.type = i;
      var data1 = _.clone(data, true);
      User.allpath(data1, cashflow, onReturn);
    }


    function callCallback() {
      alltypes = _.sortBy(alltypes, function(n) {
        return n.type;
      });
      callback(alltypes);
    }

  },
  allpath: function(data, cashflow, callback) {
    var typeno = data.type;
    if (data.type == 0) {
      data.type = "";
    }
    data.type = data.type + "0%";
    var longpercent = [];
    var shortpercent = [];
    var count = 0;
    var nocallback = 0;
    var i = 1;
    var totalpath = 99;

    function onReturn(resp) {
      if (resp) {
        nocallback++;
        data.path = i++;
        if (resp.count) {
          count++;
        }
        longpercent.push(resp.longpercent);
        shortpercent.push(resp.shortpercent);
      }
      if (nocallback == totalpath) {
        callCallback();
      } else {
        User.compute(data, cashflow, onReturn);
      }
    }
    data.path = i;
    User.compute(data, cashflow, onReturn);

    function callCallback() {

      var sortedLong = _.sortBy(longpercent, function(n) {
        return n;
      });
      var sortedShort = _.sortBy(shortpercent, function(n) {
        return n;
      });
      var median1 = Math.round(1 / 100 * totalpath);
      callback({
        type: typeno,
        long: Math.round(sortedLong[median1]),
        short: Math.round(sortedShort[median1]),
        goalchance: Math.round(((totalpath - count) / totalpath) * 100)
      });
    }

  },
  compute: function(data, cashflow, callback) {
    if(!cashflow)
    {
      cashflow=[];
      User.generateCashflow(data, cashflow);
    }
    var tempoutput;
    var requestData = {};
    if (true) {

      var pathPercent = [];
      Grid.findTenureByPath({
        path: data.path,
        type: data.type
      }, function(resp) {
        if (resp && Array.isArray(resp)) {
          for (var i = 0; i < cashflow.length; i++) {
            var key = resp[i];
            pathPercent[key.tenure - 1] = key.value;
          };
          var totalAmountPaid = data.lumpsum + (data.monthly * data.noOfMonth);
          tempoutput = User.computePathData(pathPercent, cashflow, data.startMonth, totalAmountPaid);
          callback(tempoutput);
        } else {
          callback();
        }

      });

    }
  },

  generateAllPathTenure: function(data,callback) {
    var cashflow = [];
    User.generateCashflow(data, cashflow);
    console.log(cashflow);
    var totalpath = 99;
    var paths = [];
    for(var i=0;i<totalpath;i++)
    {
      paths[i]={i:i,goalChange:0,shortPercent:0,longPercent:0,pathVal:cashflow[0],pathValArr:[cashflow[0]],values:[]};
    }
    Grid.findGridByType(data, function(res,err){
      _.each(res,function(n) {
        console.log(n);
        var i=n.path-1;
        var tenure = n.tenure;
        if(i<totalpath && tenure < cashflow.length && paths[i].pathVal>0)
        {
          paths[i].values.push(n.value);
          var newPath = Math.round((paths[i].pathVal * n.value/100)+cashflow[tenure]);
          if(newPath>0)
          {
            if(tenure==12)
            {
              paths[i].short=newPath;
            }
            paths[i].pathVal=newPath;
          }
          else {
            paths[i].goalChange=1;
            paths[i].long=User.calcLongValue(cashflow,tenure,paths[i].pathVal);
            paths[i].pathVal=0;
          }

          paths[i].pathValArr.push(paths[i].pathVal);
        }

      });
      paths[0].cashflow = cashflow;
      callback(paths[0]);
    });



  },
  calcLongValue: function(cashflow, currentmonth, lastamount) {
    var newCashflow = cashflow.slice(0, currentmonth);
    var totalval = 0;
    _.each(newCashflow, function(n) {
      if (n < 0) {
        totalval += n;
      }
    });
    return (totalval * -1) + lastamount;
  },
  computePathData: function(path, cash, startMonth, totalAmountPaid) {
    var pathval;
    var pathvalarr = [];
    pathval = cash[0];
    pathvalarr.push(pathval);
    var longvalue = 0;
    var prevpathval = pathval;
    var goalmonth = 1;
    var cashmonth = 1;
    var goalcount = false;
    var short = 0;
    var i = 0;
    var stopgoal = false;
    var j = 0;
    var returnthis = {};
    for (i = 1; i < path.length; i++) {
      prevpathval = pathval;
      pathval = User.computePath({
        pathval: pathval,
        percent: path[i],
        amount: cash[i]
      });
      pathvalarr.push(pathval);
      if (i == 12) {
        short = pathval;
      }
      if (pathval == 0 || i == (path.length - 1)) {

        if (pathval == 0) {
          goalcount = true;
          longvalue = User.calcLongValue(cash, i, prevpathval);
        } else {
          longvalue = User.calcLongValue(cash, i + 1, pathval);
        }
        break;
      }
    }
    returnthis = {
      short: short,
      count: goalcount,
      long: longvalue,
      path: path,
      cash: cash,
      startMonth: startMonth,
      pathval: pathvalarr,
      longpercent: (1 - (longvalue / totalAmountPaid)) * -100,
      shortpercent: (1 - (short / totalAmountPaid)) * -100,
      totalAmountPaid: totalAmountPaid
    };
    return returnthis;
  },
  computePath: function(data) {
    var output = Math.round(data.pathval * (data.percent / 100) + data.amount);
    if (output < 0)
      return 0;
    else
      return output;
  },
  findlimited: function(data, callback) {
    var newreturns = {};
    newreturns.data = [];
    var check = new RegExp(data.search, "i");
    var pagesize = parseInt(data.pagesize);
    var pagenumber = parseInt(data.pagenumber);
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        callbackfunc1();

        function callbackfunc1() {
          db.collection("user").count({
            name: {
              '$regex': check
            }
          }, function(err, number) {
            if (number && number != "") {
              newreturns.total = number;
              newreturns.totalpages = Math.ceil(number / data.pagesize);
              callbackfunc();
            } else if (err) {
              console.log(err);
              callback({
                value: false
              });
              db.close();
            } else {
              callback({
                value: false,
                comment: "Count of null"
              });
              db.close();
            }
          });

          function callbackfunc() {
            db.collection("user").find({
              name: {
                '$regex': check
              }
            }).skip(pagesize * (pagenumber - 1)).limit(pagesize).toArray(function(err, found) {
              if (err) {
                callback({
                  value: false
                });
                console.log(err);
                db.close();
              } else if (found && found[0]) {
                newreturns.data = found;
                callback(newreturns);
                db.close();
              } else {
                callback({
                  value: false,
                  comment: "No data found"
                });
                db.close();
              }
            });
          }
        }
      }
    });
  },
  //Findlimited
  findone: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find({
          _id: sails.ObjectID(data._id)
        }).toArray(function(err, data2) {
          if (err) {
            console.log(err);
            callback({
              value: false
            });
            db.close();
          } else if (data2 && data2[0]) {
            delete data2[0].password;
            callback(data2[0]);
            db.close();
          } else {
            callback({
              value: false,
              comment: "No data found"
            });
            db.close();
          }
        });
      }
    });
  },
  isModerator: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find({
          _id: sails.ObjectID(data.moderator),
          accesslevel: "moderator"
        }).toArray(function(err, data2) {
          if (err) {
            callback({
              value: false
            });
            db.close();
          } else if (data2 && data2[0]) {
            callback({
              value: true
            });
            db.close();
          } else {
            callback({
              value: false,
              comment: "Moderator is non-existent."
            });
            db.close();
          }
        });
      }
    });
  },
  //Findlimited
  findApproved: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find({
          approved: 1
        }).toArray(function(err, data2) {
          if (err) {
            console.log(err);
            callback({
              value: false
            });
            db.close();
          } else if (data2 && data2[0]) {
            callback(data2);
            db.close();
          } else {
            callback({
              value: false,
              comment: "No data found"
            });
            db.close();
          }
        });
      }
    });
  },
  //Findlimited
  findAwaitingApproval: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find({
          approved: 0
        }).toArray(function(err, data2) {
          if (err) {
            console.log(err);
            callback({
              value: false
            });
            db.close();
          } else if (data2 && data2[0]) {
            callback(data2);
            db.close();
          } else {
            callback({
              value: false,
              comment: "No data found"
            });
            db.close();
          }
        });
      }
    });
  },
  //Findlimited
  findRejected: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      if (db) {
        db.collection("user").find({
          approved: -1
        }).toArray(function(err, data2) {
          if (err) {
            console.log(err);
            callback({
              value: false
            });
            db.close();
          } else if (data2 && data2[0]) {
            callback(data2);
            db.close();
          } else {
            callback({
              value: false,
              comment: "No data found"
            });
            db.close();
          }
        });
      }
    });
  },
  delete: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      db.collection('user').remove({
        _id: sails.ObjectID(data._id)
      }, function(err, deleted) {
        if (deleted) {
          callback({
            value: true
          });
          db.close();
        } else if (err) {
          console.log(err);
          callback({
            value: false
          });
          db.close();
        } else {
          callback({
            value: false,
            comment: "No data found"
          });
          db.close();
        }
      });
    });
  },
  deleteRejected: function(data, callback) {
    sails.query(function(err, db) {
      if (err) {
        console.log(err);
        callback({
          value: false
        });
      }
      db.collection('user').remove({
        approved: -1
      }, function(err, deleted) {
        if (deleted) {
          callback({
            value: true
          });
          db.close();
        } else if (err) {
          console.log(err);
          callback({
            value: false
          });
          db.close();
        } else {
          callback({
            value: false,
            comment: "No data found"
          });
          db.close();
        }
      });
    });
  }
};
