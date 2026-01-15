from flask import Flask, Response, request
from flask_socketio import SocketIO
import cv2
import atexit
from base64 import b64encode
from yaml import load,Loader
import time

with open("config.yaml", "r") as f:
    config = load(stream=f, Loader=Loader)

app = Flask(__name__)
socketio = SocketIO(app)

camera = None

def setup_camera(index = config["camera_index"]):
    global camera

    if camera:
        camera.release()

    camera = cv2.VideoCapture(index, cv2.CAP_DSHOW)

    camera.set(cv2.CAP_PROP_FRAME_WIDTH, config["width"])
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, config["height"])

    if not camera.isOpened():
        raise RuntimeError("Failed to open webcam")

@atexit.register
def cleanup():
    if camera:
        print("Releasing camera")
        camera.release()

def generate_frame():
    start = time.time()
    if camera:
        success, frame = camera.read()
    else:
        return False
    if not success:
        return False
    _, buffer = cv2.imencode(config["filetype"], frame, [cv2.IMWRITE_JPEG_QUALITY, 100])
    end = time.time()
    print(f"Frametime {round(end-start,5)}\r",end="")
    return buffer

@app.route('/')
def page():
    with open("page/index.html", "r") as f:
        return Response(f.read(), mimetype='text/html')
    
@app.route('/video.js')
def video():
    with open("page/video.js", "r") as f:
        return Response(f.read(), mimetype='text/javascript')
    
@app.route('/frame')
def frame():
    return Response(generate_frame().tobytes(), mimetype=config["content_type"])
    

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_connect():
    print('Client disconnected')

@socketio.on('frame')
def handle_message(sid):
    socketio.emit("frame", f'data:{config["content_type"]};base64,{b64encode(generate_frame()).decode()}', to=sid)


if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=8080, threaded=True)
    setup_camera()
    socketio.run(app, host=config["host"], port=config["port"], debug=config["flask_debug"])