from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.http.response import JsonResponse
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .processor import *
from gtts import gTTS
import speech_recognition as sr
r = sr.Recognizer()


# Create your views here.
@csrf_exempt
def index(request):
    if request.method == "POST":
        record = Record.objects.create(
            voice_record=default_storage.save('records/uservoice.WAV', ContentFile(request.FILES['file'].read())))
        record.save()

        return JsonResponse(
            {
                "data": record.voice_record.url,
                "response1": record.response_bot_audio.url
            }
        )

    return render(request, 'index.html', context={})


@csrf_exempt
def chatbot(request):
    if request.method == 'POST':
        the_question = request.POST['question']

        response = chatbot_response(the_question.capitalize())

    return JsonResponse({"response": response})
