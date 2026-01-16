var socket = io.connect('http://' + window.location.host);
var frameinterval;
var framefreeze = false;

var starttime, endtime;
var framecount = 0;
var frametime = 0;

var targetfps = 60; // how many times should frames be requested per second (if possible)

function start() {
    var canvas = document.getElementById("videoscreen");
    var object = document.getElementById('videodata');
    var statuse = document.getElementById("status");

    var width = object.width;
    var height = object.height;

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);


    var context;
    if (canvas.getContext) {
        context = canvas.getContext('2d', { willReadFrequently: true });
    }


    socket.on('connect', function () {
        statuse.innerText = '';

        frameinterval = setInterval(function() {
            if (!framefreeze) {                  // if we aren't drawing anything
                socket.emit("frame", socket.id); // get something to draw
                framefreeze = true;              // and don't get any more in the meantime
                starttime = new Date().getTime();
            }
        },1000 / targetfps);
    });

    socket.on('disconnect', function () {
        statuse.innerHTML ='<span style="color:red;">HELP ME! HELP ME!</span>';
        if(frameinterval) {clearInterval(frameinterval); frameinterval=null;}
    });

    socket.on("connect_error", (err) => {
        statuse.innerHTML = '<span style="color:red;">WHAT? HELP ME! Connection failed: ' + err.message + '</span>';
        if(frameinterval) {clearInterval(frameinterval); frameinterval=null;}
    });

    socket.on('frame', function (data) {
        //console.log('Server says: ' + data);
        object.src = data;
    });

    //https://github.com/kasperific/HTML5ChromaKey
    object.onload = function () {
        context.drawImage(object, 0, 0, width, height);
        imgDataNormal = context.getImageData(0, 0, width, height);
        var imgData = context.createImageData(width, height);
        for (i = 0; i < imgData.width * imgData.height * 4; i += 4) {
            var r = imgDataNormal.data[i + 0];
            var g = imgDataNormal.data[i + 1];
            var b = imgDataNormal.data[i + 2];
            var a = imgDataNormal.data[i + 3];
            if ((r <= 100) && (200 <= g) && (b <= 100)) {
                a = 0;
            }
            if (a != 0) {
                imgData.data[i + 0] = r;
                imgData.data[i + 1] = g;
                imgData.data[i + 2] = b;
                imgData.data[i + 3] = a;
            }
        }

        context.putImageData(imgData, 0, 0);
        framefreeze = false;

        endtime = new Date().getTime();
        framecount++;
        frametime += endtime - starttime;
        statuse.innerHTML = `took ${endtime-starttime}ms to get frame avg ${Math.round(frametime/framecount)}`;
    }
}

            