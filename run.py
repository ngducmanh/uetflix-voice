from flask import Flask, render_template, url_for, send_from_directory, request
import os
import time
import json
from vr import recognition

app = Flask(__name__)
UPLOAD_FOLDER = 'upload'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/")
def main():
    return render_template('index.html')


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        extension = os.path.splitext(file.filename)[1]
        f_name = 'sound' + extension
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], f_name))
        
        recog = recognition(f_name)
        response = app.response_class(
                response=json.dumps(recog, ensure_ascii=False),
                status=200,
                mimetype='application/json'
        )
        return response


if __name__ == "__main__":
    app.run(debug=True,host = '0.0.0.0',port=8300)
