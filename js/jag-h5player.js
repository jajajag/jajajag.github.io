/* Get the jQuery object from the dom tree. */
var video = $('#jag-video');
/* 判断设备是否为移动设备。 */
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

/* 1. 可复用函数 */

/* 1.1 播放或暂停 */
function playOrPause() {
    /* 暂停时播放，否则暂停。 */
    if (video[0].paused) {
        video[0].play();
    } else {
        video[0].pause();
    }
}

/* 1.2 动态生成控制栏 */
var controlPanel = $('#control-panel');
var volumeBar = $('#volume-bar');

function rebuildControlPanel() {
    /* 获取当前视频高和宽, 控制栏高度为50px。 */
    controlPanel.css('top', video.height() - 50);
    controlPanel.css('width', video.width());
    if (isIOS) {
        /* 如果是ios，则音量条颜色为灰色 */
        volumeBar.css('color', 'gray');
    }
}

/* 1.3 申请全屏 */
var fullscreenItem = $('#fullscreen-item');

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
        } else if(video[0].webkitEnterFullscreen) {
            /* ios只允许调用video本身的全屏 */
            video[0].webkitEnterFullscreen();
        }
    }
}

/* 1.4 将秒转化为时分秒字符串 */
function timeToString(time) {
    var seconds = Math.floor(time) % 60;
    seconds = (seconds < 10) ? '0' + seconds : String(seconds);
    var minutes = String(Math.floor(time / 60) % 60);
    minutes = (minutes < 10) ? '0' + minutes : String(minutes);
    var hours = String(Math.floor(time / 3600));
    hours = (hours < 10) ? '0' + hours : String(hours);
    return hours + ':' + minutes + ':' + seconds;
}

/* 1.5 更新缓冲条 */
var bufferBar = $('#jag-buffer-bar');

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

/* 1.6 根据偏移量更新进度条位置 */
var progressBar = $('#jag-progress-bar');
var progressButton = $('#progress-button');

function updateProgressBar(offsetX) {
    var leftOffset = offsetX - video.offset().left - 15;
    progressBar.css('width', leftOffset);
    progressButton.css('left', 7 + leftOffset);
}

/* 1.7  隐藏控制栏 */
var playbackList = $('.playback-list');
var controlPanelTimer = 0;
var onControlPanelFlag = false;

function controlPanelHide() {
    /* 若计时器已归零并且鼠标不在控制栏上，则隐藏控制栏。 */
    if (controlPanelTimer == 0 && (isMobile || !onControlPanelFlag)) {
        /* 需要设置为none，否则移动端会可以点击。 */
        controlPanel.css('display', 'none');
        playbackList.css('display', 'none');
    }
    /* 计时器每隔500ms更新一次。 */
    controlPanelTimer = (controlPanelTimer > 500) ? controlPanelTimer - 500 : 0;
    setTimeout(controlPanelHide, 500);
}

/* 2. 加载元数据并初始化 */
var durationLabel = '';
/* Get duration from loadedmettadata. */
/* 加载完元数据后计算总时间。 */
video.on('loadedmetadata', function() {
    /* 计算总时长。 */
    durationLabel = timeToString(video[0].duration);
    if (durationLabel.split(':')[0] == '00') {
        durationLabel = durationLabel.substr(3);
    }
    /* 如果小时数不为0，则显示全部3位。 */
    if (durationLabel.length > 5) {
        $('#time-label').text('00:00:00/' + durationLabel);
    } else {
        $('#time-label').text('00:00/' + durationLabel);
    }
    /* 加载完全部元数据后构建控制栏。 */
    rebuildControlPanel();
    /* 开始第一次更新缓冲条。 */
    startBuffer();
    /* 初始化控制面板的计时器。 */
    controlPanelHide();
});

/* 3. 键盘事件 */
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
            } else {
                video[0].currentTime = 0;
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

/* 4. 鼠标触屏点击事件 */
/* There should be an interval between two single click.
 *  We overlook the single click if two clicks are too close.
 *  singleClickFlag is a lock of clicks. */

/* 4.1 鼠标/触屏单击 */
var singleClickFlag = true;
/* Listening to mouse single click event. */
video.on('tap', function() {
    if (singleClickFlag) {
        /* Set the lock if it is the first click. */
        singleClickFlag = false;
        /* Timeout for 300ms. */
        setTimeout(function() {
            if (!singleClickFlag) {
                if (!isMobile) {
                    /* Change the status of .*/
                    playOrPause();
                } else {
                    if (controlPanel.css('display') == 'none') {
                        controlPanel.css('display', 'block');
                        controlPanelTimer = 8000;
                    } else {
                        controlPanel.css('display', 'none');
                    }
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

/* 4.2 鼠标/触屏双击 */
/* Listening to mouse double click event.
 *  PC端双击全屏，移动端双击暂停。 */
video.on('dblclick', function() {
    if (isMobile) {
        playOrPause();
    } else {
        getFullscreen();
    }
});

/* 4.3 移动端长按 */
video.on('taphold', function() {
    if (isMobile) {
        getFullscreen();
    }
});

/* 5. 进度条点击事件 */

/* 进度条点击事件(使用tap可避免同时触发进度条和进度条按钮事件)。 */
/* 5.1 进度条单击事件 */
$('.progress-bar-container').on('tap', function(event) {
    /* 点击事件的偏移量为相对文档的偏移量减去视频偏移量减去控制栏。 */
    var leftOffset = event.pageX - video.offset().left - 15;
    /* 获取控制栏总长度。 */
    var progressWidth = video.width() - 30;
    /* 点击坐标的左偏移量除以控制栏长度，和播放时间百分比相等。 */
    video[0].currentTime = leftOffset / progressWidth * video[0].duration;
});

/* 5.2 进度按钮拖动事件(PC) */
var progressDragFlag = false;

/* 5.2.1 鼠标按下进度条按钮 */
progressButton.on('mousedown', function(event) {
    progressDragFlag = true;
    updateProgressBar(event.pageX);
});

/* 5.2.2 鼠标拖动进度条按钮 */
$(document).on('mousemove', function(event) {
    if(progressDragFlag) {
        updateProgressBar(event.pageX);
    }
});

/* 5.2.3 鼠标离开进度条按钮 */
$(document).on('mouseup', function(event) {
    if (progressDragFlag) {
        progressDragFlag = false;
        updateProgressBar(event.pageX);
        var leftOffset = event.pageX - video.offset().left - 15;
        /* 获取控制栏总长度。 */
        var progressWidth = video.width() - 30;
        /* 点击坐标的左偏移量除以控制栏长度，和播放时间百分比相等。 */
        video[0].currentTime = leftOffset / progressWidth * video[0].duration;
    }
});

/* 5.3 进度按钮拖动事件(移动端) */
var lastTouchOffset = 0;

/* 5.2.1 触控点击进度条按钮 */
progressButton.on('touchstart', function(event) {
    progressDragFlag = true;
    updateProgressBar(event.touches[0].clientX);
});

/* 5.2.2 触控拖动进度条按钮 */
$(document).on('touchmove', function(event) {
    if(progressDragFlag) {
        updateProgressBar(event.touches[0].clientX);
        lastTouchOffset = event.touches[0].clientX;
    }
});

/* 5.2.3 触控离开进度条按钮 */
$(document).on('touchend', function() {
    if (progressDragFlag) {
        progressDragFlag = false;
        updateProgressBar(lastTouchOffset);
        var leftOffset = lastTouchOffset - video.offset().left - 15;
        /* 获取控制栏总长度。 */
        var progressWidth = video.width() - 30;
        /* 点击坐标的左偏移量除以控制栏长度，和播放时间百分比相等。 */
        video[0].currentTime = leftOffset / progressWidth * video[0].duration;
    }
});


/* 6. 控制栏按钮点击事件 */

/* 6.1 播放按钮点击事件 */
var playButton = $('#play-button');

playButton.on('tap', playOrPause);

/* 6.2.1 音量按钮点击事件 */
var volumeButton = $('#volume-button');

volumeButton.on('tap', function() {
    if (video[0].muted) {
        video[0].muted = false;
        volumeBar.css('width', video[0].volume * 60);
    } else {
        video[0].muted = true;
        volumeBar.css('width', 0);
    }
});

/* 6.2.2 音量条点击事件 */
$('.volume-box').on('tap', function(event) {
    if (isIOS) {
        return;
    }
    /* 点击事件的偏移量为相对文档的偏移量减去视频偏移量减去控制栏。 */
    var leftOffset = event.pageX - video.offset().left - 93;
    /* 音量条长度为60px。 */
    var percentage = leftOffset / 60;
    /* 判断是否在音量条区域外(方便点击)。 */
    percentage = (percentage >= 1) ? 1 : percentage;
    /* 静音状态不修改音量条位置。 */
    if (!video[0].muted) {
        /* 音量条当前位置。 */
        volumeBar.css('width', leftOffset / 60 * 100 + '%');
    }
    /* 修改音量大小。 */
    video[0].volume = percentage;
});

/* 6.3 全屏按钮点击事件 */
var fullscreenButton = $('#fullscreen-button');
fullscreenButton.on('tap', getFullscreen);

/* 6.4.1 播放速度按钮点击事件 */
var playbackButton = $('#playback-button');

playbackButton.on('tap', function() {
    /* 显示或者收回播放速率列表。 */
    playbackList.toggle('fast');
});

/* 6.4.2 播放速率列表点击事件 */
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
    setTimeout(function() {
        playbackList.hide('fast');
    }, 200);
});

/* 6.5.1 鼠标在按钮上停留事件 */
/* 若鼠标在按钮上变为亮紫色。仅PC端。 */
$('.jag-button').on('mouseover', function() {
    if (!isMobile) {
        $(this).css('color', 'fuchsia');
    }
});

/* 6.5.2 鼠标离开按钮事件 */
/* 鼠标离开按钮变回白色。 */
$('.jag-button').on('mouseout', function() {
    if (!isMobile) {
        $(this).css('color', 'white');
    }
});

/* 7. 视频固有事件 */

/* 7.1 视频时间更新事件 */
/* 根据当前时间更新进度条，缓冲条和按钮。 */
video.on('timeupdate', function() {
    /* 7.1.1 更新进度条 */
    var maxDuration = video[0].duration;
    /* 获取当前时间和缓冲条。 */
    var currentPos = video[0].currentTime;
    /* 拖拽进度条按钮时不更新进度条。 */
    if (!progressDragFlag) {
        var currentBuffer = video[0].buffered.end(0);
        /* 获取进度条和缓冲条百分比。 */
        var perCurrent = 100 * currentPos / maxDuration;
        var perBuffer = 100 * (currentBuffer - currentPos) / maxDuration;
        perBuffer = (perBuffer < 0) ? 0 : perBuffer;
        /* 进度条长度为视频长度减去边缘长度。 */
        var progressWidth = video.width() - 30;
        /* 修改css中width属性改变进度条。 */
        progressBar.css('width', perCurrent + '%');
        /* 修改css中left属性改变进度按钮。 */
        progressButton.css({
            /* 按钮的左偏移量为7，根据当前时间更新按钮。 */
            left: 7 + progressWidth * currentPos / maxDuration
        });
    }
    /* 7.1.2 更新缓冲条 */
    if (currentBuffer < maxDuration) {
        bufferBar.css('width', perBuffer + '%');
    } else {
        bufferBar.css('width', (100 - perCurrent) + '%');
    }

    /* 7.1.3 更新时间标签 */
    /* 如果总时长超过1小时，则显示3位。 */
    if (durationLabel.length > 5) {
        $('#time-label').text(timeToString(currentPos) + '/' + durationLabel);
    } else {
        /* 否则只显示分钟和秒。 */
        $('#time-label').text(timeToString(currentPos).substr(3) + '/' + durationLabel);
    }
});

/* 7.2 鼠标在视频和控制栏移动事件 */

/* 7.2.1 鼠标在视频上移动事件 */
video.on('mousemove', function() {
    /* 每次在屏幕上移动时更新控制栏。 */
    //rebuildControlPanel();
    /* 如果鼠标在屏幕上移动，则显示控制条并重设计时器。 */
    if (!isMobile) {
        controlPanel.css('display', 'block');
        controlPanelTimer = 4000;
    }
});

/* 7.2.2 鼠标在控制栏上停留事件 */
/* 若在控制栏上则为true，否则为false。 */
controlPanel.on('mouseover', function() {
    onControlPanelFlag = true;
});

/* 7.2.3 鼠标离开控制栏事件 */
controlPanel.on('mouseout', function() {
    onControlPanelFlag = false;
});

/* 7.3 视频播放/暂停事件 */

/* 7.3.1 视频播放事件 */
video.on('pause', function() {
    /* 当视频暂停时，修改按钮样式。 */
    playButton.removeClass();
    playButton.addClass('glyphicon glyphicon-play jag-button');
});

/* 7.3.2 视频播放事件 */
video.on('play', function() {
    /* 当视频开始时，修改按钮样式。 */
    playButton.removeClass();
    playButton.addClass('glyphicon glyphicon-pause jag-button');
});

/* 7.4 视频音量改变事件 */
video.on('volumechange', function() {
    /* 当音量变化时，修改音量键图标。 */
    if (video[0].muted) {
        volumeButton.removeClass();
        volumeButton.addClass('glyphicon glyphicon-volume-off jag-button');
    } else {
        volumeButton.removeClass();
        volumeButton.addClass('glyphicon glyphicon-volume-up jag-button');
    }
});

/* 8. 全局事件 */

/* 8.1 浏览器窗口大小改变事件 */
/* 浏览器窗口大小改变时，修正控制栏位置。 */
$(window).on('resize', rebuildControlPanel);

/* 8.2 全屏切换事件 */
/* 全屏切换时，修正控制栏位置。 */
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

/* 8.3 播放器禁用右键菜单 */
fullscreenItem.contextmenu(function() {
    return false;
});

/* 8.4 在dom树加载完成后创建控制条 */
$(document).ready(rebuildControlPanel);