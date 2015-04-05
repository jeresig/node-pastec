node-pastec
================

Node module for interacting with a [Pastec](http://pastec.io/) server.

    var pastec = require("pastec")({
        server: "localhost:4212"
    });

    pastec.add("test.jpg", "test", function() {
        pastec.fileSimilar("test/test.jpg", function(err, matches) {
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

## add(fileName, dirName, callback)

Upload an image file to a Pastec server and put it in the specified directory. For example if you were to upload:

    add("/var/data/test.jpg", "sample")

You should end up with a file with an ID of: `"sample/test.jpg"` in the Pastec index.

`fileName` can also be an array of files to upload.

## urlSimilar(url, callback)

Given the URL of an image, return a list of similar images from the database (in the same format as the `similar()` method). For example:

    pastec.urlSimilar("http://test.com/test.jpg", function(err, matches) {
        matches.forEach(function(match) {
            console.log(match.filepath + " " + match.score + "% match.");
        });
    });

The image at the specified URL is not added to the Pastec index.

The object returned as a match would look something like this:

    {
        score: '97.60',
        target_overlap_percent: '99.98',
        overlay: 'overlay/?query=sample/test1.jpg&target=sample/test2.jpg&m21=-3.87874e-05&m22=1.00005&m23=-0.0119187&m11=1.00005&m13=-0.00554278&m12=3.87874e-05',
        query_overlap_percent: '100.00',
        filepath: 'sample/test2.jpg'
    }

## del(ID, callback)

Given a specified MatchEngine file ID (for example `"sample/test.jpg"`), delete that particular image from the index. It will no longer be returned in the results.


Credits
===

Created by [John Resig](http://ejohn.org/).

Released under an MIT license.
