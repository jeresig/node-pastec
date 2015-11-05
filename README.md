node-pastec
================

Node module for interacting with a [Pastec](http://pastec.io/) server.

    var pastec = require("pastec")({
        server: "localhost:4212"
    });

    pastec.add("test.jpg", "1234", function() {
        pastec.fileSimilar("test.jpg", function(err, matches) {
            console.log("Similar images:");
            matches.forEach(function(item) {
                console.log(" - ", item.filepath);
            });
        });
    });

Installation
===

    npm install pastec

API
===

## add(fileName, id, callback)

Upload an image file to a Pastec server and assign it the specified ID for later retrieval. For example if you were to upload:

    add("/var/data/test.jpg", "1234")

You should end up with a file with an ID of: `1234` in the Pastec index.

## fileSimilar(filePath, callback)

Given the path to an image file, return an array of similar images from the database (in the same format as the `urlSimilar()` method). For example:

    pastec.fileSimilar("test.jpg", function(err, matches) {
        matches.forEach(function(match) {
            console.log(match.filepath + " " + match.score + "% match.");
        });
    });

The image is not added to the Pastec index. The object returned as a match would look something like this:

    {
        "filepath":"./3107100095036_002.jpg",
        "rects":{"height":636,"width":421,"x":43,"y":62},
        "score":42
    }

## urlSimilar(url, callback)

Given the URL of an image, return an array of similar images from the database (in the same format as the `fileSimilar()` method). For example:

    pastec.urlSimilar("http://test.com/test.jpg", function(err, matches) {
        matches.forEach(function(match) {
            console.log(match.id + " " + match.score + "% match.");
        });
    });

The image at the specified URL is not added to the Pastec index. The object returned as a match would look something like this:

    {
        "id":"./3107100095036_002.jpg",
        "rect":{"height":636,"width":421,"x":43,"y":62},
        "score":42
    }

## del(ID, callback)

Given a specified Pastec file ID (for example `1234`), delete that particular image from the index. It will no longer be returned in the results.

## list(callback)

Returns an object that holds all the IDs that are currently in the index.

## saveIndex(indexFile, callback)

Save the image similarity index to the server at the specified `indexFile` location. Note that the path to the `indexFile` is to a path relative to the server, not the local environment.

Credits
===

Created by [John Resig](http://ejohn.org/).

Released under an MIT license.
