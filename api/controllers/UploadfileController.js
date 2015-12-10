//var lwip = require('lwip');
module.exports = {
    upload: function(req, res) {
        sails.query(function(err, db) {
            if (err) {
                console.log(err);
                res.json({
                    value: "false",
                    comment: "Error"
                });
            } else if (db) {
                req.file("file").upload({
                    maxBytes: 100000000
                }, function(err, uploadedFiles) {
                    if (err) {
                        console.log(err);
                        res.json({
                            value: "false",
                            comment: "Error"
                        });
                        db.close();
                    } else if (uploadedFiles) {
                        _.each(uploadedFiles, function(n) {
                            var filepath = n.fd;
                            var newfilepath = n.fd;
                            var newfilenamearr = newfilepath.split(".");
                            var extension = newfilenamearr.pop();
                            var mimetype = sails.mime.lookup(n.fd);
                            var newdate = sails.moment(new Date()).format('YYYY-MM-DDh-mm-ss-SSSSa');
                            var filename = 'image' + newdate + '.' + extension;
                            db.open(function(err, db) {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        value: "false",
                                        comment: "Error"
                                    });
                                    db.close();
                                } else if (db) {
                                    var fileId = new sails.ObjectID();
                                    var gridStore = new sails.GridStore(db, fileId, filename, 'w', {
                                        content_type: mimetype
                                    });
                                    gridStore.open(function(err, gridStore) {
                                        if (err) {
                                            console.log(err);
                                            res.json({
                                                value: "false",
                                                comment: "Error"
                                            });
                                            db.close();
                                        } else if (gridStore) {
                                            gridStore.writeFile(filepath, function(err, doc) {
                                                if (err) {
                                                    console.log(err);
                                                    res.json({
                                                        value: "false",
                                                        comment: "Error"
                                                    });
                                                    db.close();
                                                } else if (doc) {
                                                    sails.fs.unlink(filepath, function(err) {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        res.json({
                                                            fileid: fileId
                                                        });
                                                        db.close();
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    getupload: function(req, res) {
        if (req.query.file && req.query.file != "" && sails.ObjectID.isValid(req.query.file)) {
            sails.query(function(err, db) {
                if (err) {
                    console.log(err);
                } else if (db) {
                    var filename = req.query.file;
                    var fileId = sails.ObjectID(filename);
                    var file = new sails.GridStore(db, fileId, "r");
                    db.collection("fs.files").find({
                        _id: fileId
                    }).toArray(function(err, found) {
                        if (err) {
                            console.log(err);
                            res.json({
                                value: "false",
                                comment: "Error"
                            });
                            db.close();
                        } else if (found && found[0]) {
                            file.open(function(err, file) {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        value: "false",
                                        comment: "Error"
                                    });
                                    db.close();
                                } else if (file) {
                                    res.set('Content-Type', file.contentType);
                                    var stream = file.stream();
                                    stream.pipe(res);
                                    file.close();
                                }
                            });
                        } else {
                            res.json({
                                value: "false",
                                comment: "No data found"
                            });
                            db.close();
                        }
                    });
                }
            });
        } else {
            res.json({
                value: "false",
                comment: "Upload-id is incorrect"
            });
        }
    },
};