/* Get the jQuery object from the dom tree. */
var video = $('#jagVideo');

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

/* Listening to mouse double click event. */
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
        this.getMenu().find("li").eq(2).find('a').html("This was dynamically changed");
        return true;
    }
});




/* .play() and .pause() method. */
$('.btnPlay').on('click', function() {
    if(video[0].paused) {
        video[0].play();
    }
    else {
        video[0].pause();
    }
    return false;
});


/* Get duration from loadedmettadata. */
video.on('loadedmetadata', function() {
    $('.duration').text(video[0].duration);
});

/* Get currentTime from timeupdate. */
video.on('timeupdate', function() {
    var currentPos = video[0].currentTime; //Get currenttime
    var maxduration = video[0].duration; //Get video duration
    var percentage = 100 * currentPos / maxduration; //in %
    $('.timeBar').css('width', percentage+'%');
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
setTimeout(startBuffer, 500);

//Mute/Unmute control clicked
$('.muted').click(function() {
    video[0].muted = !video[0].muted;
    return false;
});

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

//Rewind control
$('.rw').on('click', function() {
    video[0].playbackrate = -3;
    return false;
});

//Slow motion control
$('.sl').on('click', function() {
    video[0].playbackrate = 0.5;
    return false;
});

$('.fullscreen').on('click', function() {
    //For Webkit
    video[0].webkitEnterFullscreen();

    //For Firefox
    video[0].mozRequestFullScreen();

    return false;
});