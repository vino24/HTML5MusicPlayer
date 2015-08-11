var Player = function () {
    var obj, mt, playing = false, that = this;
    var cover_bg = $('.cover_bg');
    var playbtn = $('#playbtn');
    var volbar = $('#fmvol');
    var prog = $('.progdiv');
    var volbg = document.getElementById("volbg");   //  用以调用getBoundingClientRect

    //  初始化
    this.init = function (id) {

        obj = $(id)[0];
        var $obj = $(obj);

        $obj.bind('loadeddata', updateTimer);

        $obj.bind('progress', function () {
            console.log(obj.readyState);
            //  @todo 网络流畅状态下Chrome/Firefox readystate只有0/4两个，IE无效
            //  通过readystate判定媒体内容加载情况，保证在可读取buffer信息时才调用onSoundBuffering
            if (obj.readyState !== 0 && obj.readyState !== 1) {
                onSoundBuffering();
            }
        });

        $obj.bind('play', function () {
            playing = true;
            //  在音频可以播放时开启动画
            $('.cover_bg').addClass('rotate');
        });

        $obj.bind('timeupdate', updateTimer);
        $obj.bind('ended', onSoundComplete);

        this.operateControls();
    };

    //
    this.operateControls = function () {
        //  播放/暂停控制
        playbtn.bind('click', this.playpause);
        //  音量条控制
        volbar.bind('click', function () {
            var display = $('.vol').css('display');
            if (display == "none")
                $('.vol').css('display', 'block');
            else
                $('.vol').css('display', 'none');
        });
        //  跳转
        prog.bind('mousedown', audioSeek);
        //  音量控制
        $('#volbg').bind('click', function (e) {
            var length = volbg.getBoundingClientRect().bottom - e.clientY;
            var percent = (volbg.offsetHeight - length) / volbg.offsetHeight;
            obj.volume = 1 - percent;
            $('#voltime').css('height', (percent * 100) + "%");
        });
    };

    this.audioPlaying = function () {
        if (playing) {
            updateTimer();
            if (!playbtn.hasClass('pausebtn')) {
                playbtn.addClass('pausebtn');
            }
        }
    };

    this.play = function (ct) {
        if (ct > 0) {
            obj.currentTime = ct * obj.duration / 100;
        } else {
            obj.play();
        }
        playing = true;
        playbtn.addClass('pausebtn');
        return false;
    };

    this.pause = function () {
        obj.pause();
        playing = false;
        playbtn.removeClass('pausebtn');
        return false;
    };
    //  播放/暂停
    //@ todo 如何保持暂停时动画位置？ animation-play-state：pause 暂停动画，元素样式也会回到原始状态
    this.playpause = function () {
        if (playing) {
            that.pause();
            cover_bg.removeClass('rotate');
        } else {
            that.play();
            cover_bg.addClass('rotate');
        }
        return false;
    };

    var audioSeek = function (e) {
        if (obj.paused || obj.ended) {
            this.play();
            enhanceAudioSeek(e);
        }
        else {
            enhanceAudioSeek(e);
        }
    };
    //    跳转函数
    var enhanceAudioSeek = function (e) {
        var progdiv = document.getElementById("progdiv");
        //  计算跳转长度
        var length = e.clientX - progdiv.getBoundingClientRect().left;
        var percent = length / progdiv.offsetWidth;
        //  更新currentTime
        obj.currentTime = (percent * obj.duration);
        updateTimer();
    };
    //  更新缓存条
    var onSoundBuffering = function () {
        var mt = parseInt(obj.duration);
        console.log(obj.buffered.end(0));
        var bt = obj.buffered.end(0);
        //  计算当前缓存内容百分百
        var percent_loaded = Math.floor(bt / mt * 100);
        $('#pgbuf').css('width', percent_loaded + '%');
    };

    //  自动播放下一首
    var onSoundComplete = function () {
        if (next_id == 0) {
            get_song(-1, open_id);
        }
        else {
            get_song(next_id, open_id);
        }

    };

    //  更新进度条
    var updateTimer = function () {
        mt = parseInt(obj.duration);
        var ct = parseInt(obj.currentTime);
        //  timeConvent((mt - ct));
        //  $('#timeremain').text('-' + min + ':' + sec);
        var percent = parseInt(ct * 100 / mt);
        $('#pgtime').css('width', percent + '%');
    };
};

function audioPlaying() {
    player.audioPlaying();
};

function initsite() {
    dwidth = $('body').width();
    dheight = $('body').height();
    $('#fmlistbox').css('left', 0 - dwidth);//-dwidth
};

/*
 //  时间格式化
 function timeConvent(ts) {
 ts = Math.round(ts * 100) / 100;
 var mm = checkTime(parseInt(ts / 60));
 var ss = checkTime(parseInt(ts % 60));
 return mm + ":" + ss;
 }

 //  时间美化
 function checkTime(i) {
 if (i < 10) {
 i = "0" + i;
 }
 return i;
 }
 */

