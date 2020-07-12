import speech_recognition as sr
import glob
from pydub import AudioSegment
import wave
import numpy as np
import numpy
import scipy.io.wavfile
from scipy.fftpack import dct

from reduce_noise import remove_noise

r = sr.Recognizer()


def detect_leading_silence(sound, silence_threshold=-50.0, chunk_size=10):
    trim_ms = 0  # ms

    assert chunk_size > 0  # to avoid infinite loop
    while sound[trim_ms:trim_ms+chunk_size].dBFS < silence_threshold and trim_ms < len(sound):
        trim_ms += chunk_size

    return trim_ms


def trim():
    sound = AudioSegment.from_file(".//upload/sound", format="wav")

    start_trim = detect_leading_silence(sound)
    end_trim = detect_leading_silence(sound.reverse())

    duration = len(sound)
    trimmed_sound = sound[start_trim:duration-end_trim]
    trimmed_sound.export(".//upload/trim", format="wav")


def recognition(filename):
    trim()
    remove_noise()

    for file in glob.glob("upload/remove_noise.wav"):
        wav_file = sr.AudioFile(file)
        with wav_file as source:
            audio = r.record(source)
            text = r.recognize_google(audio, language="en-US")
            return {'text': text}
