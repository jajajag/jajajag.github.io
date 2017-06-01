/* Get the jQuery object from the dom tree. */
var video = $('#jag-video');
var fullscreenItem = $('#fullscreen-item');

function playOrPause() {
    /* 暂停时播放，否则暂停。 */
    if (video[0].paused) {
        video[0].play();
    } else {
        video[0].pause();
    }
}

/* 1. 键盘事件 */
/* Listening to the keyboard event (keydown here). */
$(document).on('keydown', function(event) {
    switch (event.which) {
        case 32:
            /* Play/Pause if we tape space key. */
            playOrPause();
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

/* 2. 鼠标点击视频事件 */
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
                playOrPause();
            }
            /* Open the clock if the function ends. */
            singleClickFlag = true;
        }, 300);
    } else {
        /* Open the clock if the click is close. */
        singleClickFlag = true;
    }
});

function getFullscreen() {
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
        if (fullscreenItem[0].requestFullscreen) {
            fullscreenItem[0].requestFullscreen();
        } else if (fullscreenItem[0].webkitRequestFullscreen) {
            fullscreenItem[0].webkitRequestFullscreen();
        } else if (fullscreenItem[0].mozRequestFullScreen) {
            fullscreenItem[0].mozRequestFullScreen();
        } else if (fullscreenItem[0].msRequestFullscreen) {
            fullscreenItem[0].msRequestFullscreen();
        }
    }
}

/* Listening to mouse double click event.
*  监听鼠标双击事件。 */
video.on('dblclick', getFullscreen);


/* 3. 控制栏 */
var controlPanel = $('#control-panel');
var progressButton = $('#progress-button');

/* 动态生成控制栏。 */
function rebuildControlPanel() {
    /* 控制栏高度为50px。 */
    controlPanel.css({
        /* 获取当前视频高和宽。 */
        'top': video.height() - 50,
        'width': video.width()
    });
}
/* 初始化控制栏。 */
rebuildControlPanel();

/* 监听浏览器窗口大小改变时控制栏改变大小。 */
$(window).on('resize', rebuildControlPanel);

/* 监听全屏事件，进入或退出时修正控制栏位置。 */
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

/* 4. 进度条 */
var progressBar = $('#jag-progress-bar');
var bufferBar = $('#jag-buffer-bar');

/* 根据当前时间更新进度条，缓冲条和按钮。 */
video.on('timeupdate', function() {
    var maxDuration = video[0].duration;
    /* 获取当前时间和缓冲条。 */
    var currentPos = video[0].currentTime;
    var currentBuffer = video[0].buffered.end(0);
    /* 获取进度条和缓冲条百分比。 */
    var perCurrent = 100 * currentPos / maxDuration;
    var perBuffer = 100 * (currentBuffer - currentPos) / maxDuration;
    /* 进度条长度为视频长度减去边缘长度。 */
    var progressWidth = video.width() - 30;
    /* 修改css中width属性改变进度条。 */
    progressBar.css('width', perCurrent + '%');
    /* 修改css中left属性改变进度按钮。 */
    progressButton.css({
        /* 按钮的左偏移量为7，根据当前时间更新按钮。 */
        left: 7 + progressWidth * currentPos / maxDuration
    });
    /* 未完全缓冲时。 */
    if (currentBuffer < maxDuration) {
        bufferBar.css('width', perBuffer + '%');
    } else {
        bufferBar.css('width', (100 - perCurrent) + '%');
    }
});

/* 进度条点击事件。 */
$('.progress-bar-container').on('click', function(event) {
    /* 点击事件的偏移量为相对文档的偏移量减去视频偏移量减去控制栏。 */
    var leftOffset = event.pageX - video.offset().left - 15;
    /* 获取控制栏总长度。 */
    var progressWidth = video.width() - 30;
    /* 点击坐标的左偏移量除以控制栏长度，和播放时间百分比相等。 */
    video[0].currentTime = leftOffset / progressWidth * video[0].duration;
});

/* 进度按钮拖动事件。 */






/* 在播放前调用此函数更新缓冲条。 */
function startBuffer() {
    var maxDuration = video[0].duration;
    /* 获取视频当前缓冲进度和当前时间。 */
    var currentBuffer = video[0].buffered.end(0);
    var currentPos = video[0].currentTime;
    /* 在暂停并且未完全缓冲时，更新缓冲条。防止同时更新引起颤抖。 */
    if (video[0].paused && currentBuffer < maxDuration) {
        var percentage = 100 * (currentBuffer - currentPos) / maxDuration;
        bufferBar.css('width', percentage + '%');
        /* 每秒更新一次缓冲条。 */
        setTimeout(startBuffer, 1000);
    }
};
/* 开始第一次更新缓冲条。 */
setTimeout(startBuffer, 1000);

/* 5. 控制栏按钮 */
var playButton = $('#play-button');
var volumeButton = $('#volume-button');
var fullscreenButton = $('#fullscreen-button');
var playbackButton = $('#playback-button');
var playbackList = $('.playback-list');

/* 下面是控制条按钮事件。 */
/* 点击播放按钮时，开始或暂停视频。 */
playButton.on('click', playOrPause);

volumeButton.on('click', function() {
    video[0].muted = !video[0].muted;
});

fullscreenButton.on('click', getFullscreen);

playbackButton.on('click', function() {
    /* 显示或者收回播放速率列表。 */
    playbackList.toggle('fast');
});

/* 播放速率列表点击事件。 */
$('.list-group-item').on('click', function() {
    video[0].playbackRate = parseFloat($(this).text());
    var list = $('.list-group-item');
    /* 清空所有按钮类并重新赋值。 */
    for (var i = 0; i < list.length; ++i) {
        $(list[i]).removeClass();
        $(list[i]).addClass('list-group-item');
    }
    /* 为当前按钮添加active属性。 */
    $(this).addClass('active');
    /* 延迟300ms关闭播放速率列表。 */
    setTimeout(function() {playbackList.hide('fast');}, 300);
});

/* 6. 视频本身事件 */
/* 用一个计时器记录未移动时间, flag记录鼠标是否在控制栏上。 */
var controlPanelTimer = 0;
var onControlPanelFlag = false;
video.on('mousemove', function() {
    /* 如果鼠标在屏幕上移动，则显示控制条并重设计时器。 */
    controlPanel.show();
    controlPanelTimer = 4000;
});

/* 若在控制栏上则为true，否则为false。 */
controlPanel.on('mouseover', function() {
    onControlPanelFlag = true;
});

controlPanel.on('mouseout', function() {
    onControlPanelFlag = false;
});

/* 隐藏控制栏的函数。 */
function controlPanelHide() {
    /* 若计时器已归零并且鼠标不在控制栏上，则隐藏控制栏。 */
    if (controlPanelTimer == 0 && !onControlPanelFlag) {
        controlPanel.hide();
    }
    /* 计时器每隔500ms更新一次。 */
    controlPanelTimer = (controlPanelTimer > 500) ? controlPanelTimer - 500 : 0;
    setTimeout(controlPanelHide, 500);
}
/* 初始化计时器。 */
controlPanelHide();

/* 下面是视频播放事件。 */
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

/* Forbid right click. */
/* 设置禁用右键。 */
video.contextmenu(function() {
    return false;
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


//Volume control clicked
$('.volumeBar').on('mousedown', function(e) {
    var position = e.pageX - volume.offset().left;
    var percentage = 100 * position / volume.width();
    $('.volumeBar').css('width', percentage+'%');
    video[0].volume = percentage / 100;
});
