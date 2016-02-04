module.exports = {
    adminlogin: function (data, callback) {
        if (data.password) {
            data.password = sails.md5(data.password);
            sails.query(function (err, db) {
                if (db) {
                    db.collection('user').find({
                        email: data.email,
                        password: data.password,
                        accesslevel: "moderator"
                    }, {
                        password: 0,
                        forgotpassword: 0
                    }).toArray(function (err, found) {
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
    save: function (data, callback) {
        sails.query(function (err, db) {
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
                    db.collection('user').insert(data, function (err, created) {
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
                    }, function (err, updated) {
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
    find: function (data, callback) {
        //        console.log(sails.finance.PV());
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find().toArray(function (err, found) {
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

    generateCashflow: function (data, cashflow) {
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

    alltypes: function (data, callback) {
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
            if (nocallback == 1) {
                callCallback();
            }
        }

        for (var i = 0; i <= 10; i++) {
            data.type = i;
            var data1 = _.clone(data, true);
            User.allpath(data1, cashflow, onReturn);
        }


        function callCallback() {
            alltypes = _.sortBy(alltypes, function (n) {
                return n.type;
            });
            callback(alltypes);
        }

    },
    alltypes2: function (data, callback) {



        var cashflow = [];
        var dates = [];
        User.generateCashflow(data, cashflow);
        var month;
        month = new Date();
        for(var i =0 ; i<cashflow.length;i++){

          var temp = month.setMonth(month.getMonth() + 1);
          dates.push(temp);
          console.log((i+1)+" "+new Date(temp));
        }

         new Date("2015-03-25")
        var nocallback = 0;
        var type = 0;
        var alltypes = [];

        function onReturn(resp, type) {
            if (resp) {
                var obj = {
                    type: type,
                    tenure: resp
                };
                nocallback++;
                alltypes.push(obj);
            }
            if (nocallback == 11) {
                callCallback();
            }
        }
        for (var i = 0; i <= 10; i++) {
            data.type = i;
            var data1 = _.clone(data, true);
            User.generateAllPathTenure(data1, cashflow, onReturn);
        }

        function callCallback() {
            alltypes = _.sortBy(alltypes, function (n) {
                return n.type;
            });
            var firstArr = [];
            var feasible = [];
            var goals = [];
            var short = [];
            var long = [];
            var i = 0;
            _.each(alltypes, function (key) {
                firstArr = key.tenure.slice(1);
                // console.log(firstArr);
                var median1 = _.pluck(firstArr, "median1");
                var median50 = _.pluck(firstArr, "median50");
                var median99 = _.pluck(firstArr, "median99");
                var tenures = _.pluck(firstArr, "tenureNo");
                var percentage = _.pluck(firstArr, "percentage");
                var longpercent = _.pluck(firstArr, "longpercent");
                percentage = percentage.slice(0, 12);
                percentage = _.sortBy(percentage, function (n) {
                    return n;
                });
                // console.log(percentage);
                short[i] = percentage[0].toFixed(2);
                goals[i] = firstArr[0].goalchance.toFixed(2);
                long[i]=_.find(longpercent, function(o) { return o != 100; });
                if(long[i]== undefined || long[i]== null){
                  long[i]=100;
                }
                short[i] = (100-short[i]).toFixed(2);
                long[i] = (100 - long[i]).toFixed(2);
                if (goals[i] > 50 && -short[i] > -data.shortinput && -long[i] > -data.longinput) {
                var xirr = User.XIRR(cashflow,dates)*100;
                var requiredRate = Math.pow(parseFloat(Math.abs(1+xirr/100)),parseFloat((1/12)))-1;
                    feasible.push({
                        type: i,
                        tenures: tenures,
                        median1: median1,
                        median50: median50,
                        median99: median99,
                        short: short[i],
                        goal: goals[i],
                        long: long[i],
                        requiredRate:requiredRate
                    });
                }
                i++;
            });
            if (feasible.length == 0) {
                callback({
                    value: false,
                    short: short,
                    goals: goals,
                    long: long
                });
            } else {
                callback({
                    value: true,
                    short: short,
                    goals: goals,
                    long: long,
                    feasible: feasible,
                    cashflow: cashflow
                });
            }
        }
    },
    allpath: function (data, cashflow, callback) {
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
        var totalpath = 950;

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

            var sortedLong = _.sortBy(longpercent, function (n) {
                return n;
            });
            var sortedShort = _.sortBy(shortpercent, function (n) {
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
    compute: function (data, cashflow, callback) {
        if (!cashflow) {
            cashflow = [];
            User.generateCashflow(data, cashflow);
        }
        var tempoutput;
        var requestData = {};
        if (true) {

            var pathPercent = [];
            Grid.findTenureByPath({
                path: data.path,
                type: data.type
            }, function (resp) {
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

    generateAllPathTenure: function (data, cashflow, callback) {
        var typeno = data.type;
        var pathvalgrid = [];
        var goalcount = 0;
        var pathtemp = [];
        _.each(cashflow, function () {
            pathvalgrid.push([]);
        });

        if (data.type == 0) {
            data.type = "";
        }
        data.type = data.type + "0%";
        if (!cashflow) {
            var cashflow = [];
            User.generateCashflow(data, cashflow);
        }
        var totalpath = 950;
        var paths = [];
        for (var i = 0; i < totalpath; i++) {
            paths[i] = {
                i: i,
                goalChange: 0,
                pathVal: cashflow[0],
                pathValArr: [cashflow[0]],
                values: []
            };
        }
        Grid.findGridByType(data, function (res, err) {
            _.each(res, function (n) {
                var i = n.path - 1;
                var tenure = n.tenure;
                if (i < totalpath && tenure < cashflow.length && paths[i].pathVal > 0) {
                    paths[i].values.push(n.value);
                    var newPath = Math.round((paths[i].pathVal * n.value / 100) + cashflow[tenure]);

                    if (newPath > 0) {
                        pathvalgrid[tenure][i] = newPath;
                        if (tenure == 12) {
                            paths[i].short = newPath;
                        }
                        paths[i].pathVal = newPath;
                    } else {
                        paths[i].goalChange = 1;
                        ++goalcount;
                        paths[i].long = User.calcLongValue(cashflow, tenure, paths[i].pathVal);
                        paths[i].pathVal = 0;
                        // for (j = tenure; j < cashflow.length; j++) {
                        //     pathvalgrid[j][i] = 0;
                        // }
                        pathvalgrid[tenure][i]=newPath;
                    }
                    paths[i].pathValArr.push(paths[i].pathVal);
                }
            });
            var tenure = [];
            var pathvaltemp = [];
            var med1key = Math.ceil((totalpath - 1) / 100);
            var med50key = Math.ceil((totalpath - 1) / 2);
            var med99key = Math.ceil(99 * (totalpath - 1) / 100);
            var foundLast = false;
            for (var i = 0; i < cashflow.length; i++) {
                pathvaltemp = pathvalgrid[i];
                pathvaltemp = _.sortBy(pathvaltemp, function (key) {
                    return key;
                });

                tenure.push({
                    tenureNo: i,
                    median1: pathvaltemp[med1key],
                    median50: pathvaltemp[med50key],
                    median99: pathvaltemp[med99key],
                    pathlength: pathvaltemp.length,
                    goalchance: 100 - ((goalcount / totalpath) * 100)
                });
                if (i === 0) {
                    tenure[i].percentage = User.calcLongValue(cashflow, i + 1, cashflow[0]);
                    tenure[i].ith = i + 1;
                    tenure[i].lastone = cashflow[0];
                } else {
                    tenure[i].percentage = User.calcLongValue(cashflow, i + 1, tenure[i].median1);
                    tenure[i].ith = i + 1;
                    tenure[i].lastone = tenure[i].median1;
                    if(!foundLast && tenure[i].lastone ==0 ){
                      tenure[i].lastMed50=tenure[i].median50;
                      tenure[i].cashflowLast=cashflow[i];
                      foundLast = true;
                      tenure[i].longpercent=tenure[i].percentage;
                    }else if(!foundLast && i == (cashflow.length-1) ){
                      tenure[i].lastMed50=tenure[i].median50;
                      tenure[i].cashflowLast=cashflow[i];
                      foundLast=true;
                      tenure[i].longpercent=tenure[i].percentage;
                    }else{
                      tenure[i].longpercent=100;
                    }
                }
                if(foundLast===false ){
                  tenure[i].longpercent=100;
                }

            }
            callback(tenure, typeno);
        });



    },
    XNPV: function(rate, values) {
		var xnpv = 0.0;
		var firstDate = new Date(values[0].Date);
		for (var key in values) {
			var tmp = values[key];
			var value = tmp.Flow;
			var date = new Date(tmp.Date);
			xnpv += value / Math.pow(1 + rate, this.DaysBetween(firstDate, date)/365);
		};
		return xnpv;
	},
   XIRR: function(values, dates, guess) {
// Credits: algorithm inspired by Apache OpenOffice

// Calculates the resulting amount
var irrResult = function(values, dates, rate) {
  var r = rate + 1;
  var result = values[0];
  for (var i = 1; i < values.length; i++) {
    result += values[i] / Math.pow(r, moment(dates[i]).diff(moment(dates[0]), 'days') / 365);
  }
  return result;
}

// Calculates the first derivation
var irrResultDeriv = function(values, dates, rate) {
  var r = rate + 1;
  var result = 0;
  for (var i = 1; i < values.length; i++) {
    var frac = moment(dates[i]).diff(moment(dates[0]), 'days') / 365;
    result -= frac * values[i] / Math.pow(r, frac + 1);
  }
  return result;
}

// Check that values contains at least one positive value and one negative value
var positive = false;
var negative = false;
for (var i = 0; i < values.length; i++) {
  if (values[i] > 0) positive = true;
  if (values[i] < 0) negative = true;
}

// Return error if values does not contain at least one positive value and one negative value
if (!positive || !negative) return '#NUM!';

// Initialize guess and resultRate
var guess = (typeof guess === 'undefined') ? 0.1 : guess;
var resultRate = guess;

// Set maximum epsilon for end of iteration
var epsMax = 1e-10;

// Set maximum number of iterations
var iterMax = 50;

// Implement Newton's method
var newRate, epsRate, resultValue;
var iteration = 0;
var contLoop = true;
do {
  resultValue = irrResult(values, dates, resultRate);
  newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
  epsRate = Math.abs(newRate - resultRate);
  resultRate = newRate;
  contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
} while(contLoop && (++iteration < iterMax));

if(contLoop) return '#NUM!';

// Return internal rate of return
return resultRate;
},
    calcLongValue: function (cashflow, currentmonth, lastamount) {
        var cashflowtill = cashflow.slice(0, currentmonth);
        var posValue = 0;
        _.each(cashflowtill, function (n) {
            if (n > 0) {
                posValue += n;
            }
        });

        var negValue = 0;
        _.each(cashflowtill, function (n) {
            if (n < 0) {
                negValue += n;
            }
        });

        return ((negValue * -1) + lastamount) / posValue * 100;
    },
    computePathData: function (path, cash, startMonth, totalAmountPaid) {
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
    computePath: function (data) {
        var output = Math.round(data.pathval * (data.percent / 100) + data.amount);
        if (output < 0)
            return 0;
        else
            return output;
    },
    findlimited: function (data, callback) {
        var newreturns = {};
        newreturns.data = [];
        var check = new RegExp(data.search, "i");
        var pagesize = parseInt(data.pagesize);
        var pagenumber = parseInt(data.pagenumber);
        sails.query(function (err, db) {
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
                    }, function (err, number) {
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
                        }).skip(pagesize * (pagenumber - 1)).limit(pagesize).toArray(function (err, found) {
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
    findone: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    _id: sails.ObjectID(data._id)
                }).toArray(function (err, data2) {
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
    isModerator: function (data, callback) {
        sails.query(function (err, db) {
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
                }).toArray(function (err, data2) {
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
    findApproved: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    approved: 1
                }).toArray(function (err, data2) {
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
    findAwaitingApproval: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    approved: 0
                }).toArray(function (err, data2) {
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
    findRejected: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("user").find({
                    approved: -1
                }).toArray(function (err, data2) {
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
    delete: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            db.collection('user').remove({
                _id: sails.ObjectID(data._id)
            }, function (err, deleted) {
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
    deleteRejected: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            db.collection('user').remove({
                approved: -1
            }, function (err, deleted) {
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
