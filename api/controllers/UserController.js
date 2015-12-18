/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: function(req, res) {
        if (req.body) {
            if (req.body._id) {
                if (req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                    user();
                } else {
                    res.json({
                        value: false,
                        comment: "User-id is incorrect"
                    });
                }
            } else {
                user();
            }

            function user() {
                var print = function(data) {
                    res.json(data);
                }
                User.save(req.body, print);
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    delete: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function(data) {
                    res.json(data);
                }
                User.delete(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    compute: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        User.compute(req.body, callback);
    },
    find: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.find(req.body, callback);
    },
    generateCashflow: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.generateCashflow(req.body, callback);
    },
    generatePathData: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.generatePathData(req.body, callback);
    },
     adminlogin: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        User.adminlogin(req.body, callback);
    },
    findApproved: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.findApproved(req.body, callback);
    },
    deleteRejected: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.deleteRejected(req.body, callback);
    },
    findAwaitingApproval: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.findAwaitingApproval(req.body, callback);
    },
    findRejected: function(req, res) {
        function callback(data) {
            res.json(data);
        };
        User.findRejected(req.body, callback);
    },
    findone: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function(data) {
                    res.json(data);
                }
                User.findone(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    isModerator: function(req, res) {
        if (req.body) {
            if (req.body.moderator && req.body.moderator != "" && sails.ObjectID.isValid(req.body.moderator)) {
                var print = function(data) {
                    res.json(data);
                }
                User.isModerator(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "User-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    findlimited: function(req, res) {
        if (req.body) {
            if (req.body.pagesize && req.body.pagesize != "" && req.body.pagenumber && req.body.pagenumber != "") {
                function callback(data) {
                    res.json(data);
                };
                User.findlimited(req.body, callback);
            } else {
                res.json({
                    value: false,
                    comment: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    }
};
