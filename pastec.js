var fs = require("fs");
var path = require("path");

var request = require("request");

module.exports = function(conf) {
    conf.server = conf.server || "localhost:4212";

    return {
        url: "http://" + conf.server + "/index/",

        handle: function(callback, expected) {
            return function(err, res, body) {
                if (!callback) {
                    return;
                }

                if (err || res.statusCode !== 200) {
                    return callback(err);
                }

                var data = JSON.parse(body);

                if (expected && data.type !== expected) {
                    return callback(data);
                }

                callback(null, data.result || data);
            };
        },

        del: function(id, callback) {
            request.del(this.url + "images/" + id,
                 this.handle(callback, "IMAGE_REMOVED"));
        },

        list: function(callback) {
            // NOTE: Need implementation in Pastec
        },

        similar: function(file, callback) {
            // NOTE: Need implementation in Pastec
        },

        fileSimilar: function(file, callback) {
            fs.createReadStream(file)
                .pipe(request.post(this.url + "searcher",
                    this.handle(callback, "SEARCH_RESULTS")));
        },

        urlSimilar: function(url, callback) {
            request.get(url)
                .pipe(request.post(this.url + "searcher",
                    this.handle(callback, "SEARCH_RESULTS")));
        },

        add: function(file, id, callback) {
            fs.createReadStream(file)
                .pipe(request.put(this.url + "images/" + id,
                    this.handle(callback, "IMAGE_ADDED")));
        }
    };
};