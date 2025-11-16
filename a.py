from flask import Flask, Response, request
import cv2
import atexit
import time

app = Flask(__name__)
camera = cv2.VideoCapture(1, cv2.CAP_DSHOW)

#width, height = 640, 480
width, height = 960, 720

content_type, filetype = "image/jpg", ".jpg"

camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)


if not camera.isOpened():
    raise RuntimeError("Failed to open webcam")

@atexit.register
def cleanup():
    print("Releasing camera")
    camera.release()

def generate_frame():
    start = time.time()
    success, frame = camera.read()
    if not success:
        raise Exception("NOT SUCCESS " + success)
    _, buffer = cv2.imencode(filetype, frame, )
    a = buffer.tobytes()
    end = time.time()
    print(f"Frametime: {end-start} - Size: {len(a)}")
    return a
def generate_frames():
    while True:
        yield (b'--frame\r\n'
               b'Content-Type: '+ content_type.encode() + b' \r\n\r\n' + generate_frame() + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/frame')
def frame():
    return Response(generate_frame(), mimetype=content_type)

@app.route('/')
def page():
    #with open("Untitled-1.html", "r") as f:
    with open("page.html", "r") as f:
        return Response(f.read())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)