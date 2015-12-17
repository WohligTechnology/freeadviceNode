/**
 * GridController
 *
 * @description :: Server-side logic for managing grids
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    save: function (req, res) {
        if (req.body) {
            if (req.body._id) {
                if (req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                    user();
                } else {
                    res.json({
                        value: false,
                        comment: "Grid-id is incorrect"
                    });
                }
            } else {
                user();
            }

            function user() {
                console.log(req.body);
                var print = function (data) {
                    res.json(data);
                }
                Grid.save(req.body, print);
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    delete: function (req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function (data) {
                    res.json(data);
                }
                Grid.delete(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Grid-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    find: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Grid.find(req.body, callback);
    },
    generateData: function (req, res) {
        function callback(data) {
            res.json(data);
        };
            Grid.generateData(req.body, callback);
    },
    generateDataByType: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Grid.generateDataByType(req.body, callback);
    },
    findone: function (req, res) {
        if (req.body) {
            if (req.body._id && req.body._id != "" && sails.ObjectID.isValid(req.body._id)) {
                var print = function (data) {
                    res.json(data);
                }
                Grid.findone(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Grid-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    findTenureByPath: function (req, res) {
        if (req.body) {
            if (req.body.type && req.body.type != "" && req.body.path && req.body.path != "") {
                var print = function (data) {
                    res.json(data);
                }
                Grid.findTenureByPath(req.body, print);
            } else {
                res.json({
                    value: false,
                    comment: "Grid-id is incorrect"
                });
            }
        } else {
            res.json({
                value: false,
                comment: "Please provide parameters"
            });
        }
    },
    findlimited: function (req, res) {
        if (req.body) {
            if (req.body.pagesize && req.body.pagesize != "" && req.body.pagenumber && req.body.pagenumber != "") {
                function callback(data) {
                    res.json(data);
                };
                Grid.findlimited(req.body, callback);
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