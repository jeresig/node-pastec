var fs = require("fs");
var path = require("path");

var request = require("request");

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

            // Turn the results into something a little more user-friendly
            callback(err, results.image_ids.map(function(id, i) {
                return {
                    id: id,
                    rect: results.bounding_rects[i],
                    score: results.scores[i]
                };
            }));
        };
    };

    return {
        url: "http://" + conf.server + "/index/",

        del: function(id, callback) {
            request.del(this.url + "images/" + id,
                 handle("IMAGE_REMOVED", callback));
        },

        list: function(callback) {
            // NOTE: Need implementation in Pastec
        },

        similar: function(id, callback) {
            // NOTE: Need implementation in Pastec
        },

        fileSimilar: function(file, callback) {
            fs.createReadStream(file)
                .pipe(request.post(this.url + "searcher",
                    handle("SEARCH_RESULTS", processResults(callback))));
        },

        urlSimilar: function(url, callback) {
            request.get(url)
                .pipe(request.post(this.url + "searcher",
                    handle("SEARCH_RESULTS", processResults(callback))));
        },

        filterByMinScore: function(data, score) {
            return data.map(function(item) {
                return item.score >= score;
            });
        },

        add: function(file, id, callback) {
            fs.createReadStream(file)
                .pipe(request.put(this.url + "images/" + id,
                    handle("IMAGE_ADDED", callback)));
        },

        saveIndex: function(indexFile, callback) {
            request.post({
                url: this.url + "io",
                json: {type: "WRITE", index_path: indexFile}
            }, handle("INDEX_WRITTEN", callback));
        }
    };
};