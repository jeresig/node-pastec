var fs = require("fs");
var path = require("path");

var request = require("request");

var idCache;

module.exports = function(conf) {
    conf.server = conf.server || "localhost:4212";

    var handle = function(expected, callback) {
        return function(err, res, body) {
            if (!callback) {
                return;
            }

            if (err || res.statusCode !== 200) {
                return callback(err);
            }

            var data = typeof body === "string" ? JSON.parse(body) : body;

            // Watch for errors and un-expected results
            if (data.type !== expected) {
                return callback(data);
            }

            callback(null, data.result || data);
        };
    };

    var processResults = function(callback) {
        return function(err, results) {
            if (err) {
                return callback(err);
            }

            var imageIDs = results ? results.image_ids : [];

            // Turn the results into something a little more user-friendly
            callback(err, imageIDs.map(function(id, i) {
                return {
                    id: id.toString(),
                    rect: results.bounding_rects[i],
                    score: results.scores[i]
                };
            }));
        };
    };

    var url = "http://" + conf.server + "/index/";

    return {
        del: function(id, callback) {
            request.del(url + "images/" + id,
                handle("IMAGE_REMOVED", callback));
        },

        list: function(callback) {
            request.get(url + "imageIds",
                handle("INDEX_IMAGE_IDS", callback));
        },

        getCachedList: function(callback) {
            if (!idCache) {
                this.list(function(err, result) {
                    if (err) {
                        return callback(err);
                    }

                    idCache = result.image_ids;
                    callback(err, idCache);
                });

            } else {
                process.nextTick(function() {
                    callback(null, idCache);
                });
            }
        },

        idIndexed: function(id, callback) {
            this.getCachedList(function(err, list) {
                if (err) {
                    return callback(err);
                }

                callback(err, list.indexOf(parseFloat(id)) >= 0);
            });
        },

        similar: function(id, callback) {
            request.get(url + "images/" + id,
                handle("SEARCH_RESULTS", processResults(callback)));
        },

        fileSimilar: function(file, callback) {
            fs.createReadStream(file)
                .pipe(request.post(url + "searcher",
                    handle("SEARCH_RESULTS", processResults(callback))));
        },

        urlSimilar: function(url, callback) {
            request.get(url)
                .pipe(request.post(url + "searcher",
                    handle("SEARCH_RESULTS", processResults(callback))));
        },

        filterByMinScore: function(data, score) {
            return data.map(function(item) {
                return item.score >= score;
            });
        },

        add: function(file, id, callback) {
            fs.createReadStream(file)
                .pipe(request.put(url + "images/" + id,
                    handle("IMAGE_ADDED", callback)));
        },

        saveIndex: function(indexFile, callback) {
            request.post({
                url: url + "io",
                json: {type: "WRITE", index_path: indexFile}
            }, handle("INDEX_WRITTEN", callback));
        }
    };
};