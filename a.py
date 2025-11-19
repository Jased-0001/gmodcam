from flask import Flask, Response, request
from flask_socketio import SocketIO, send, emit
import cv2
import atexit
import time
import base64

app = Flask(__name__)
socketio = SocketIO(app)

camera = cv2.VideoCapture(1, cv2.CAP_DSHOW)

#width, height = 320,  240  # 240p (4:3)
#width, height = 640,  480  # 480p (4:3)
width, height = 960,  720  # 720p (4:3)
#width, height = 1280, 1080 # 1080p (4:3)

content_type, filetype = "image/jpg", ".jpg"
compression = [int(cv2.IMWRITE_JPEG_QUALITY), 100]

camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)


if not camera.isOpened():
    raise RuntimeError("Failed to open webcam")

@atexit.register
def cleanup():
    print("Releasing camera")
    camera.release()

def generate_frame():
    #start = time.time()
    success, frame = camera.read()
    if not success:
        raise Exception("NOT SUCCESS " + success)
    _, buffer = cv2.imencode(filetype, frame, compression)
    #end = time.time()
    #print(f"Frametime: {end-start} - Size: {len(buffer)}")
    return buffer
def frameurl(frame):
    return f'data:{content_type};base64,{base64.b64encode(frame).decode()}'

@app.route('/frame')
def frame():
    return Response(generate_frame().tobytes(), mimetype=content_type)

@app.route('/frame_url')
def frameurl_():
    return Response(frameurl(generate_frame()), mimetype="text/plain")



@app.route('/')
def page():
    with open("page.html", "r") as f:
        return Response(f.read(), mimetype='text/html')
    
@app.route('/video.js')
def video():
    with open("video.js", "r") as f:
        return Response(f.read(), mimetype='text/javascript')
    

@socketio.on('connect')
def handle_connect():
    print('Client connected')
@socketio.on('disconnect')
def handle_connect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(data):
    socketio.emit('frame', frameurl(generate_frame()))

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=8080, threaded=True)
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)