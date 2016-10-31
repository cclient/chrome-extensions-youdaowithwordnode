var _audioStartTime = 0;
var _autoplay = false;

var _audioPlayer = function () {
  var audio = document.createElement('audio');
  audio.setAttribute('controls', 'controls');
  audio.style.display = 'none';
  if (_autoplay)
   audio.setAttribute('autoplay', 'autoplay');
  // audio.setAttribute('src', src);
  document.body.appendChild(audio);

  function whenAudioPlay(){
    var _t = +new Date - _audioStartTime;
    // audio.removeEventListener("playing", whenAudioPlay, false);
    // console.log('audio playing, ', _t)
    _rlog.push(["_trackCustom", "actions", [
      ['audio_play_click_to_playing', _t],
      ['audio_play_src', this.getAttribute('src')]
    ]]);
  }
  audio.addEventListener("playing", whenAudioPlay, false);
  return audio;
};

var _audio = _audioPlayer();

function _playSound (url) {
  _stopSound();
  _audioStartTime = +new Date;
  _audio.setAttribute('src', url);
  _audio.play();
}

function _stopSound() {
 if (_audio.pause) {
    _audio.pause();
    if (_audio.currentTime > 0) {
      _audio.currentTime = 0;
    }
  }
}

function _setAutoPlay(autoplay) {
  _autoplay = autoplay;console.log(_audio)
  if (_audio) {
	if (autoplay)
      _audio.setAttribute('autoplay', 'autoplay');
    else
	  _audio.removeAttribute('autoplay');
  }
}

var playAudio = function () {
  var url = arguments[0];
  // stopVideo();
  // external.playSound(url);
  _playSound(url);
};

var stopAudio = function () {
  // external.stopSound();
  _stopSound();
};

var setAutoPlay = function (autoplay) {
  _setAutoPlay(autoplay);
};
