//webkitURL is deprecated but nevertheless 
URL = window.URL || window.webkitURL
var gumStream
//stream from getUserMedia() 
var rec
//Recorder.js object 
var input
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext
var audioContext = new AudioContext
//new audio context to help us record 
var recordButton = document.getElementById("recordButton")
var stopButton = document.getElementById("stopButton")
var pauseButton = document.getElementById("pauseButton")
var recordingsList = document.getElementById("recordingsList")
//add events to those 3 buttons 
recordButton.addEventListener("click", startRecording)
stopButton.addEventListener("click", stopRecording)
pauseButton.addEventListener("click", pauseRecording)

var constraints = {
    audio: true,
    video: false
}

function startRecording() {
    console.log("recordButton clicked")
    recordButton.disabled = true
    stopButton.disabled = false
    pauseButton.disabled = false

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...")
        /* assign to gumStream for later use */
        gumStream = stream
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream)
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        })
        //start the recording process 
        rec.record()
        console.log("Recording started")
    }).catch(function (err) {
        //enable the record button if getUserMedia() fails 
        recordButton.disabled = false
        stopButton.disabled = true
        pauseButton.disabled = true
    })

}

function pauseRecording() {
    console.log("pauseButton clicked rec.recording=", rec.recording)
    if (rec.recording) {
        //pause 
        rec.stop()
        pauseButton.innerHTML = "Resume"
    } else {
        //resume 
        rec.record()
        pauseButton.innerHTML = "Pause"
    }
}

function stopRecording() {
    console.log("stopButton clicked")
    //disable the stop button, enable the record too allow for new recordings 
    stopButton.disabled = true
    recordButton.disabled = false
    pauseButton.disabled = true
    //reset button just in case the recording is stopped while paused 
    pauseButton.innerHTML = "Pause"
    //tell the recorder to stop the recording 
    rec.stop() //stop microphone access 
    gumStream.getAudioTracks()[0].stop()
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(createDownloadLink)
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob)
    var au = document.createElement('audio')
    var li = document.createElement('li')
    var link = document.createElement('a')
    var sub = document.createElement('span')
    var formData = new FormData()
    var result = ''
    formData.append('file', blob)
    console.log('Upload to server')

    var request = new XMLHttpRequest()
    request.open("POST", "/upload")
    request.send(formData)

    const spinner = document.getElementById('spinner')
    spinner.style.display = 'block'

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            spinner.style.display = 'none'
            result = JSON.parse(request.response)
            var text = result.text
            window.open('http://localhost:8200/a/search?text=' + text)
            var subject = result.subject
            //add controls to the <audio> element 
            au.controls = true
            au.src = url
            //link the a element to the blob 
            link.href = url
            link.download = new Date().toISOString() + '.wav'
            link.innerHTML = text
            sub.innerHTML = `Chủ đề: ${subject}`
            //add the new audio and a elements to the li element 
            li.appendChild(au)
            li.appendChild(link)
            li.appendChild(sub)
            //add the li element to the ordered list 
            recordingsList.appendChild(li)
        }
    }
}

function uploadToServer(blob) {
    var formData = new FormData()
    formData.append('file', blob)
    console.log('Upload to server')

    var request = new XMLHttpRequest()
    request.open("POST", "/upload")
    request.send(formData)

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            alert(request.response)
        }
    }

}