var socket = io.connect('http://' + window.location.host);

var scale = 1;

function start() {
    var canvas = document.getElementById("videoscreen");
    var object = document.getElementById('videodata');
    var status = document.getElementById("status");

    var width = object.width * scale;
    var height = object.height * scale;


    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);


    var context;
    if (canvas.getContext) {
        context = canvas.getContext('2d', { willReadFrequently: true });
    }


    socket.on('connect', function () {
        status.innerText = '';
    });

    socket.on('disconnect', function () {
        status.innerHTML ='<span style="color:red;">HELP ME! HELP ME!</span>'
    });

    socket.on("connect_error", (err) => {
        status.innerHTML = '<span style="color:red;">Connection failed: ' + err.message + ' (is someone connected?)</span>';
    });

    socket.on('frame', function (data) {
        //console.log('Server says: ' + data);
        object.src = data;

        socket.send('frame');
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
            if (g > 150 && g > r && g > b) {
                a = 0;
            }
            if (a != 0) {
                imgData.data[i + 0] = r;
                imgData.data[i + 1] = g;
                imgData.data[i + 2] = b;
                imgData.data[i + 3] = a;
            }
        }
        // For image anti-aliasing
        //for (var y = 0; y < imgData.height; y++) {
        //    for (var x = 0; x < imgData.width; x++) {
        //        var r = imgData.data[((imgData.width * y) + x) * 4];
        //        var g = imgData.data[((imgData.width * y) + x) * 4 + 1];
        //        var b = imgData.data[((imgData.width * y) + x) * 4 + 2];
        //        var a = imgData.data[((imgData.width * y) + x) * 4 + 3];
        //        if (imgData.data[((imgData.width * y) + x) * 4 + 3] != 0) {
        //            offsetYup = y - 1;
        //            offsetYdown = y + 1;
        //            offsetXleft = x - 1;
        //            offsetxRight = x + 1;
        //            var change = false;
        //            if (offsetYup > 0) {
        //                if (imgData.data[((imgData.width * (y - 1)) + (x)) * 4 + 3] == 0) {
        //                    change = true;
        //                }
        //            }
        //            if (offsetYdown < imgData.height) {
        //                if (imgData.data[((imgData.width * (y + 1)) + (x)) * 4 + 3] == 0) {
        //                    change = true;
        //                }
        //            }
        //            if (offsetXleft > -1) {
        //                if (imgData.data[((imgData.width * y) + (x - 1)) * 4 + 3] == 0) {
        //                    change = true;
        //                }
        //            }
        //            if (offsetxRight < imgData.width) {
        //                if (imgData.data[((imgData.width * y) + (x + 1)) * 4 + 3] == 0) {
        //                    change = true;
        //                }
        //            }
        //        }
        //    }
        //}

        context.putImageData(imgData, 0, 0);
    }

    socket.send('frame');
}

            