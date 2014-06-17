var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
    
	var measurements = [];
    
    var peakFinder = function(fivelet){
        if(!(fivelet instanceof Array) || fivelet.length != 5 || fivelet.length != '5'){
            //res.write("fiveletlength"+fivelet.length+"\n");
            return 0;
        }
        var first = fivelet[0].frequency;
        var second = fivelet[1].frequency;
        var third = fivelet[2].frequency;
        var fourth = fivelet[3].frequency;
        var fifth = fivelet[4].frequency;
        
        if((third > second) && (third > fourth)){
            //res.write("Timestamp: "+ fivelet[1].timestamp +"\n");
            if (first < second && fourth > fifth) {
                return fivelet[2].timestamp;
            }
        }
        return 0;
    };
    
    var fivelet = [];
    var timeDiffs = [];
    var lastPeakTimestamp;

	for (var i = 0; i <= 3000; i++) {
		var frequency = fs.readFileSync('/sys/devices/ocp.2/helper.14/AIN0');
        frequency = parseInt(frequency);
        //console.log("frequency:"+ frequency+ "\n");
        if((frequency === 0) || (frequency === 1799) || (frequency === 1)){
            continue;
        }
		
        
        var timestamp = new Date().getTime();
        var currentElement = {timestamp:timestamp, frequency:frequency};
        
        fivelet.unshift(currentElement);
        fivelet = fivelet.slice(0,5);
        
        var peakTimestamp = peakFinder(fivelet);
        
        if(peakTimestamp !== 0){
            if(lastPeakTimestamp){
                //res.write("Timestamp: "+ peakTimestamp +"\n");
                var timeDiff = peakTimestamp - lastPeakTimestamp;
                
                timeDiffs.push(timeDiff/1000*60);
            }
            lastPeakTimestamp = peakTimestamp;
        }
		measurements.push(currentElement);
	}
    res.write(timeDiffs.toString());
	res.end("end");
}).listen(8080);