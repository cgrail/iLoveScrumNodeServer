var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    var measurements = [];

    var peakFinder = function (triplet) {
        if ((triplet !== Array) && (triplet.length !== 3))
            return 0;
        var first = triplet[0].frequency;
        var second = triplet[1].frequency;
        var third = triplet[2].frequency;

        if ((second > first) && (second > third)) {
            return triplet[1].timestamp;
        }
        return 0;
    };

    var triplet = [];
    var timeDiffs = [];
    var lastPeakTimestamp;

    for (var i = 0; i <= 1000; i++) {
        var frequency = fs.readFileSync('/sys/devices/ocp.2/helper.14/AIN0');
        frequency = parseInt(frequency);
        console.log("frequency:" + frequency);
        if ((frequency === 0) || (frequency === 1799)) {
            continue;
        }
        res.write("frequency:" + frequency);

        var timestamp = new Date().getTime();
        var currentElement = {timestamp: timestamp, frequency: frequency};

        triplet.push("currentElement:" + currentElement);
        triplet = triplet.slice(1, 4);
        var peakTimestamp = peakFinder(triplet);

        if (peakTimestamp !== 0) {
            if (!lastPeakTimestamp) {
                var timeDiff = lastPeakTimestamp - peakTimestamp;
                timeDiffs.push(timeDiff);
            }
            lastPeakTimestamp = peakTimestamp;
        }
        measurements.push(currentElement);
    }
    res.write(timeDiffs.toString());
    res.end("end");
}).listen(8080);