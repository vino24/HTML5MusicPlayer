// Music Player

var Player = function () {
    var obj, mt, playing = false, that = this;
    var cover_bg = $('.cover_bg');
    var playbtn = $('#playbtn');
    var volbar = $('#fmvol');
    var playbar = $('#playbtn');
    var volbg = document.getElementById("volbg");
    //  初始化播放器
    this.init = function (id) {
        //  取得audio
        obj = $(id)[0];
        var $obj = $(obj);

        $obj.bind('loadeddata', updateTimer);

        $obj.bind('progress', function () {
            console.log(obj.onprogress);
            if(obj.onprogress) {
                onSoundBuffering();
            }
        });

        $obj.bind('play', function () {
            playing = true;
            $('.cover_bg').addClass('rotate');
        });

        $obj.bind('timeupdate', updateTimer);
        $obj.bind('ended', onSoundComplete);

        $('div.timebar span.tl').click(function () {
            var width = $(this).css('width');
        });
        playbar.click(this.playpause);
        volbar.click(function () {
            var display = $('.vol').css('display');
            if (display == "none")
                $('.vol').css('display', 'block');
            else
                $('.vol').css('display', 'none');
        });
        $('#volbg').click(function (e) {
            var length = volbg.getBoundingClientRect().bottom - e.clientY;
            var percent = (volbg.offsetHeight - length) / volbg.offsetHeight;
            obj.volume = 1 - percent;
            $('#voltime').css('height', (percent * 100) + "%");
        });
    }
    this.audioPlaying = function () {
        if (playing) {
            //  var ct = parseInt(obj.currentTime);
            updateTimer();
            if (!playbar.hasClass('pausebtn')) {
                playbar.addClass('pausebtn');
            }
        }
    }
    var onSoundBuffering = function () {
        var mt = parseInt(obj.duration);
        console.log(obj.buffered.end(0));
        var bt = obj.buffered.end(0);
        var percent_loaded = Math.floor(bt / mt * 100);
        $('#pgbuf').css('width', percent_loaded + '%');
    }
    var onSoundComplete = function () {
        if (next_id == 0) {
            get_song(-1, open_id);
        }
        else {
            get_song(next_id, open_id);
        }

    }
    var updateTimer = function () {
        mt = parseInt(obj.duration);
        var ct = parseInt(obj.currentTime);
        var left = mt - ct;
        var min = parseInt(left / 60);
        var sec = left % 60;
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        $('#timeremain').text('-' + min + ':' + sec);
        var percent = parseInt(ct * 100 / mt);
        $('#pgtime').css('width', percent + '%');
    }
    this.play = function (ct) {
        if (ct > 0) {
            obj.currentTime = ct * obj.duration / 100;
        } else {
            obj.play();
        }
        playing = true;
        playbtn.addClass('pausebtn');
        return false;
    }
    this.start = function () {
        obj.play();
        return false;
    }
    this.pause = function () {
        obj.pause();
        playing = false;
        playbtn.removeClass('pausebtn');
        return false;
    }
    this.playpause = function () {
        if (playing) {
            that.pause();
            cover_bg.removeClass('rotate');
        } else {
            that.play();
            cover_bg.addClass('rotate');
        }
        return false;
    }
}
function audioPlaying() {
    player.audioPlaying();
}

function initsite() {
    dwidth = $('body').width();
    dheight = $('body').height();
    $('#fmlistbox').css('left', 0 - dwidth);//-dwidth
}

