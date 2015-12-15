/**
 * Grid.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    save: function (data, callback) {
        console.log("here");
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {

                console.log("inside db");
                if (!data._id) {
                    data._id = sails.ObjectID();
                    db.collection('grid').insert(data, function (err, created) {
                        if (err) {
                            console.log(err);
                            callback({
                                value: false,
                                comment: "Error"
                            });
                            db.close();

                        } else if (created) {
                            console.log("inside insert");
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
                    var grid = sails.ObjectID(data._id);
                    delete data._id
                    db.collection('grid').update({
                        _id: grid
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
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            if (db) {
                db.collection("grid").find().toArray(function (err, found) {
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
    generateData: function (data, callback) {
        var type = [{
            text: "0%",
            min: 94,
            max: 106
        }, {
            text: "10%",
            min: 956,
            max: 105
        }, {
            text: "20%",
            min: 96,
            max: 104
        }, {
            text: "30%",
            min: 97,
            max: 103
        }, {
            text: "40%",
            min: 98,
            max: 102
        }, {
            text: "50%",
            min: 99,
            max: 101
        }, {
            text: "60%",
            min: 100,
            max: 101
        }, {
            text: "70%",
            min: 93,
            max: 100
        }, {
            text: "80%",
            min: 100,
            max: 105
        }, {
            text: "90%",
            min: 92,
            max: 101
        }, {
            text: "100%",
            min: 91,
            max: 100
        }];
        var i, j, k;
        for (i = 0; i < type.length; i++) {
            console.log(i);
            for (j = 1; j <= 120; j++) {
                for (k = 1; k <= 100; k++) {
                    var grid = {
                        tenure: j,
                        path: k,
                        value: Math.floor(Grid.generateRandom(type[i].max, type[i].min)),
                        type: type[i].text
                    };
                    console.log(grid);
                    Grid.save(grid, function (resp) {
                        console.log("here");
                        if (resp.value) {
                            k++;
                        }
                    });
                }
            }
        }
        if (i == type.length) {
            callback({
                value: true,
                comment: "alldone"
            })
        }
    },
    generateRandom: function (max, min) {
        return Math.random() * (max - min) + min;
    },
    //Findlimited
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
                    db.collection("grid").count({
                        grid: {
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
                        db.collection("grid").find({
                            grid: {
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
                db.collection("grid").find({
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
    delete: function (data, callback) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
                callback({
                    value: false
                });
            }
            db.collection('grid').remove({
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
    }
};