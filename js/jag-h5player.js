/* Get the jQuery object from the dom tree. */
var video = $('#jag-video');
var playButton = $('#play-button');
var volumeButton = $('#volume-button');
var progressBar = $('#jag-progress-bar');
var bufferBar = $('#jag-buffer-bar');

/* Listening to the keyboard event (keydown here). */
$(document).on('keydown', function(event) {
    switch (event.which) {
        case 32:
            /* Play/Pause if we tape space key. */
            if (video[0].paused) {
                video[0].play();
            } else {
                video[0].pause();
            }
            break;
        case 37:
            /* Rewind 10s if we tape right arrow key. */
            if (video[0].currentTime >= 10) {
                /* Time should be greater than 0*/
                video[0].currentTime -= 10;
            }
            break;
        case 39:
            /* Forward 10s if we tape right arrow key. */
            if (video[0].currentTime + 10 < video[0].duration) {
                /* Current time should be smaller than the max duration. */
                video[0].currentTime += 10;
            }
            break;
    }
});

/* There should be an interval between two single click.
*  We overlook the single click if two clicks are too close.
*  singleClickFlag is a lock of clicks. */
var singleClickFlag = true;
/* Listening to mouse single click event. */
video.on('click', function() {
    if (singleClickFlag) {
        /* Set the lock if it is the first click. */
        singleClickFlag = false;
        /* Timeout for 300ms. */
        setTimeout(function() {
            if (!singleClickFlag) {
                /* Change the status of .*/
                if (video[0].paused) {
                    video[0].play();
                } else {
                    video[0].pause();
                }
            }
            /* Open the clock if the function ends. */
            singleClickFlag = true;
        }, 300);
    } else {
        /* Open the clock if the click is close. */
        singleClickFlag = true;
    }
});

/* Listening to mouse double click event.
*  监听鼠标双击事件。 */
video.on('dblclick', function() {
    /* Check if the video is alrealy in fullscreen mode. */
    if (document.fullscreenElement || document.webkitFullscreenElement ||
        document.mozFullScreenElement || document.msFullscreenElement) {
        /* Exit fullscreen if corresponding element exists. */
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        /* Request fullscreen if corresponding element exists. */
        if (video[0].requestFullscreen) {
            video[0].requestFullscreen();
        } else if (video[0].webkitRequestFullscreen) {
            video[0].webkitRequestFullscreen();
        } else if (video[0].mozRequestFullScreen) {
            video[0].mozRequestFullScreen();
        } else if (video[0].msRequestFullscreen) {
            video[0].msRequestFullscreen();
        }
    }
});

/* 动态生成控制栏。 */
function rebuildControlPanel() {
    /* 获取当前视频高和宽。 */
    var videoHeight = video.height() - 35;
    var videoWidth = video.width();
    /* 获取视频左偏移量。 */
    leftOffset = video.offsetParent()[0].offsetLeft;
    /* 控制栏高度为40px。 */
    $('#control-panel').height(35).css({
        /* 绝对定位确定控制栏位置。 */
        'position': 'absolute',
        'top': videoHeight,
        'left': leftOffset,
        'width': videoWidth,
        //'background': 'black',
        'display': 'block'
    });
}
/* 初始化控制栏。 */
rebuildControlPanel();

/* 监听浏览器窗口大小改变时控制栏改变大小。 */
$(window).on('resize', rebuildControlPanel);

/* 监听全屏事件，退出时修正控制栏位置。 */
$(document).on('fullscreenchange', function () {
    rebuildControlPanel();
});
$(document).on('mozfullscreenchange', function () {
    rebuildControlPanel();
});
$(document).on('webkitfullscreenchange', function () {
    rebuildControlPanel();
});
$(document).on("msfullscreenchange", function () {
    rebuildControlPanel();
});

/* 暂停时不管鼠标在哪里都不取消控制栏。开始时，移动到视频区域内显示，到外面立即取消，在里面不动5s取消。 */



/* 根据当前时间更新进度条。 */
video.on('timeupdate', function() {
    var maxDuration = video[0].duration;
    /* 获取当前时间。 */
    var currentPos = video[0].currentTime; //Get currenttime
    /* 获取进度条百分比。 */
    var percentage = 100 * currentPos / maxDuration; //in %
    /* 修改css中width属性改变进度条。 */
    progressBar.css('width', percentage + '%');
});

//loop to get HTML5 video buffered data
function startBuffer() {
    var maxDuration = video[0].duration;
    /* 获取视频当前缓冲进度。 */
    var currentBuffer = video[0].buffered.end(0);
    var percentage = 100 * (currentBuffer - video[0].currentTime) / maxDuration;
    bufferBar.css('width', percentage + '%');
    /* 只要未完全缓冲，就每500ms更新一次缓冲条。 */
    if(currentBuffer < maxDuration) {
        setTimeout(startBuffer, 500);
    } else {
        bufferBar.css('width', '100%');
    }
};
/* 开始第一次更新缓冲条。  */
setTimeout(startBuffer, 500);

/* 点击播放按钮时，开始或暂停视频。 */
playButton.on('click', function() {
    if (video[0].paused) {
        video[0].play();
    } else {
        video[0].pause();
    }
});

volumeButton.on('click', function() {
    video[0].muted = !video[0].muted;
});

video.on('pause', function() {
    /* 当视频暂停时，修改按钮样式。 */
    playButton.removeClass();
    playButton.addClass('glyphicon glyphicon-play');
});

video.on('play', function() {
    /* 当视频开始时，修改按钮样式。 */
    playButton.removeClass();
    playButton.addClass('glyphicon glyphicon-pause');
});

video.on('volumechange', function() {
    /* 当音量变化时，修改音量键图标。 */
    if (video[0].muted) {
        volumeButton.removeClass();
        volumeButton.addClass('glyphicon glyphicon-volume-off');
    } else {
        volumeButton.removeClass();
        volumeButton.addClass('glyphicon glyphicon-volume-up');
    }
});





/* Set context menu for right click. */
/* 设置视频右键菜单。 */
video.contextmenu({
    target: '#context-menu',
    before: function (e) {
        // This function is optional.
        // Here we use it to stop the event if the user clicks a span
        e.preventDefault();
        if (e.target.tagName == 'SPAN') {
            e.preventDefault();
            this.closemenu();
            return false;
        }
        //this.getMenu().find("li").eq(2).find('a').html("This was dynamically changed");
        return true;
    }
});





/* Get duration from loadedmettadata. */
video.on('loadedmetadata', function() {
    $('.duration').text(video[0].duration);
});



var timeDrag = false;   /* Drag status */
$('.progressBar').mousedown(function(e) {
    timeDrag = true;
    updatebar(e.pageX);
});
$(document).mouseup(function(e) {
    if(timeDrag) {
        timeDrag = false;
        updatebar(e.pageX);
    }
});
$(document).mousemove(function(e) {
    if(timeDrag) {
        updatebar(e.pageX);
    }
});

//update Progress Bar control
var updatebar = function(x) {
    var progress = $('.progressBar');
    var maxduration = video[0].duration; //Video duraiton
    var position = x - progress.offset().left; //Click pos
    var percentage = 100 * position / progress.width();

    //Check within range
    if(percentage > 100) {
        percentage = 100;
    }
    if(percentage < 0) {
        percentage = 0;
    }

    //Update progress bar and video currenttime
    $('.timeBar').css('width', percentage+'%');
    video[0].currentTime = maxduration * percentage / 100;
};

//loop to get HTML5 video buffered data
var startBuffer = function() {
    var maxduration = video[0].duration;
    var currentBuffer = video[0].buffered.end(0);
    var percentage = 100 * currentBuffer / maxduration;
    $('.bufferBar').css('width', percentage+'%');

    if(currentBuffer < maxduration) {
        setTimeout(startBuffer, 500);
    }
};
//setTimeout(startBuffer, 500);

//Volume control clicked
$('.volumeBar').on('mousedown', function(e) {
    var position = e.pageX - volume.offset().left;
    var percentage = 100 * position / volume.width();
    $('.volumeBar').css('width', percentage+'%');
    video[0].volume = percentage / 100;
});

//Fast forward control
$('.ff').on('click', function() {
    video[0].pause();
    video[0].playbackRate = 2;
    video[0].play();
    return false;
});
