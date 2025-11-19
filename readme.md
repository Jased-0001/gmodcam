# jase/gmodcam
Python script to stream a camera to a webpage to be used in Garrys Mod

## Requirements
I've only tested this on Windows 10 with Python 3.13

## Setup
1. ### Install requirements

    Use `pip install -r requirements.txt` to install required packages

2. ### Configure 

    Using `cv2-enumerate-cameras` (run `pip install cv2-enumerate-cameras` and then `py -m cv2_enumerate_cameras`),
    take the index of the camera you want to use and set it in the `config.yaml` file.

    Set the resolution you want to use (make sure it is supported by your camera)

    Set the file type and mimetype you want to use during streaming (jpeg works best)

3. ### Running

    With a terminal window open in the folder with `server.py`, run `py .\server.py`

    You should then be able to open `http://127.0.0.1:8080` and view the live camera feed 

## Credits
I used code from these
- https://github.com/kasperific/HTML5ChromaKey
- https://medium.com/@mominaman/stream-webcam-to-wsl-opencv-983e90ed7301