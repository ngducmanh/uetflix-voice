const sampleBytes = new Int8Array(4096)

const saveByteArray = (function () {
    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    return function (data, name) {
        var blob = new Blob(data, { type: "octet/stream" }),
            url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = name
        a.click()
        window.URL.revokeObjectURL(url)
    }
}())

function createAudioElement(blobUrl, blob) {
    const downloadEl = document.createElement('a')
    downloadEl.style = 'display: block'
    downloadEl.innerHTML = 'download'
    downloadEl.download = 'audio.wav'
    downloadEl.href = blobUrl
    const audioEl = document.createElement('audio')
    audioEl.controls = true
    const sourceEl = document.createElement('source')
    sourceEl.src = blobUrl
    sourceEl.type = 'audio/wav'
    audioEl.appendChild(sourceEl)
    document.body.appendChild(downloadEl)
    upload(blob)
}

function upload(blob) {
    const formData = new FormData()
    formData.append('file', blob)

    $.ajax({
        url: '/upload',
        type: "POST",
        data: formData,
        contentType: 'multipart/form-data',
        processData: false,
        success: function (stuff) {
            const {text} = stuff 
            console.log(text)
        }
    })
}

const recordAudio = () => new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const audioChunks = []

    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data)
    })

    const start = () => mediaRecorder.start()

    const stop = () => new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks)
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            const play = () => audio.play()
            createAudioElement(audioUrl, audioBlob)
            resolve({ audioBlob, audioUrl, play })
        })

        mediaRecorder.stop()
    })

    resolve({ start, stop })
})

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const handleAction = async () => {
    const recorder = await recordAudio()
    const actionButton = document.getElementById('action')
    actionButton.disabled = true
    recorder.start()
    await sleep(3000)
    const audio = await recorder.stop()
    audio.play()
    await sleep(3000)
    actionButton.disabled = false
}
