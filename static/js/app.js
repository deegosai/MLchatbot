//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
	console.log("startRecording() called");

    var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

		audioContext = new AudioContext();

		gumStream = stream;

		input = audioContext.createMediaStreamSource(stream);
		encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;

		encodingTypeSelect.disabled = true;

		recorder = new WebAudioRecorder(input, {
		  workerDir: "static/js/", // must end with slash
		  encoding: encodingType,
		  numChannels:2, //2 is the default, mp3 encoding supports only 2
		  onEncoderLoading: function(recorder, encoding) {
		  },
		  onEncoderLoaded: function(recorder, encoding) {
		  }
		});

		recorder.onComplete = function(recorder, blob) {
			createDownloadLink(blob,recorder.encoding);
			encodingTypeSelect.disabled = false;
		}

		recorder.setOptions({
		  timeLimit:120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		recorder.startRecording();


	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;

	});

	//disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
	console.log("stopRecording() called");

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	stopButton.disabled = true;
	recordButton.disabled = false;

	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();

}

function createDownloadLink(blob,encoding) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//link the a element to the blob
	link.href = url;
	link.download = new Date().toISOString() + '.'+encoding;
	link.innerHTML = link.download;


     var formData = new FormData();
    formData.append('file', blob);

$.ajax({
       url : '',
       type : 'POST',
       data : formData,
       processData: false,  // tell jQuery not to process the data
       contentType: false,  // tell jQuery not to set contentType
       success : function(data) {
//            $(".chat").append("<li class='admin clearfix'><div class='chat-body clearfix'><div class='header clearfix'><strong class='right primary-font'>You</strong></div><p>"+data+"</p></div></li><li class='agent clearfix mt-0 mb-0'><div class='chat-body clearfix'><div class='header clearfix'><strong class='primary-font'>Moon Bot</strong><small class='right text-muted'></div><p>"+data+"</p></div></li>");
           console.log("datadata");
           console.log(data.data);
       }
});
}

//$.ajax({
//                 type: "POST",
//                 url: "",
//                 data : formData,,
//                 processData: false,
//                 contentType: false,
//                 success: function(result) {
//                 console.log('>>>>>>>>>>>>>> inside success result ')
//                   $(".chat").append("<li class='admin clearfix'><div class='chat-body clearfix'><div class='header clearfix'><strong class='right primary-font'>You</strong></div><p>"+ "hellooo testinggg "+"</p></div></li><li class='agent clearfix mt-0 mb-0'><div class='chat-body clearfix'><div class='header clearfix'><strong class='primary-font'>Moon Bot</strong><small class='right text-muted'></div><p>"+result.response+"</p></div></li>");
//                   $("#stopButton").val("");
//
//                   document.getElementById('test').scrollTop = document.getElementById('test').scrollHeight;
//
//                 },
//                 error: function(result) {
//                     alert('error');
//                 }
//             });
//helper function
function __log(e, data) {
	log.innerHTML += "\n" + e + " " + (data || '');
}