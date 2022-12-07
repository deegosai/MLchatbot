import uuid
from django.db import models
import tempfile
from django.core.files import File
from gtts import gTTS
import speech_recognition as sr
r = sr.Recognizer()
from .processor import *
from io import BytesIO

class Record(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    voice_record = models.FileField(
        upload_to="records/")
    response_bot_audio = models.FileField(
        upload_to="response_bot/")
    link = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Record"
        verbose_name_plural = "Records"

    def save(self, *args, **kwargs):
        with sr.AudioFile(self.voice_record.path) as source:
            try:
                audio_text = r.listen(source)
                text = r.recognize_google(audio_text)
                if text:
                    response1 = chatbot_response(text.capitalize())
                    self.link = response1
            except Exception as e:
                response1 = "Sorry speak again"
                self.link = response1

            file_name = '{}.mp3'.format(str(self.id).lower().replace(' ', '_'))
            make_sound = gTTS(text=str(response1), lang='en')
            mp3_fp = BytesIO()
            make_sound.write_to_fp(mp3_fp)
            self.response_bot_audio.save(file_name, mp3_fp, save=False)

        super(Record, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.id)
