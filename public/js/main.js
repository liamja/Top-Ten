/*
 * Global JS
 */

var playlist = [];

$(document).ready(function() {


	$("#tracks .notification").hide();

	if ($(".centre").length > 0) {
		$("input.search-query").focus();
	}

	if ($("#player").length > 0) {

		$playerParentWidth = $(player).parent().width();

		enquire
			.register("(max-width: 767px)", { match : function(){ playerSetSize(); } } )
			.register("screen and (min-width: 768px) and (max-width: 979px)", { match : function(){ playerSetSize(); } } )
			.register("screen and (min-width: 980px) and (max-width: 1199px)", { match : function(){ playerSetSize(); } } )
			.register("screen and (min-width: 1200px)", { match : function(){ playerSetSize(); } } )
			.listen();

		var params = { allowScriptAccess: "always" };
		var atts = { id: "player" };
		swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3",
			"player", $playerParentWidth, getHeightFromWidth($playerParentWidth), "8", null, null, params, atts);
	}

	$(".form-search").submit(function(e) {
		e.preventDefault();
		var query = $(".search-query").val();
		mixpanel.track("Search", {"query" : query});
		if (query === "" || query === " ")
			return false;
		window.location.pathname = "/" + encodeURIComponent(query);
	});
});

function onYouTubePlayerReady(playerId) {
	window.player = document.getElementById("player");
	$("ol li").each(function(index) {
		playlist.push($(this).data("video-id"));
	});
	player.cuePlaylist(playlist, 0, parseInt(0), 'highres');
	player.addEventListener("onStateChange", "playerStateChange");
};

function playerStateChange(state) {
	var videoNumber = player.getPlaylistIndex();
	$("#tracks .notification").hide();
	switch(state) {
		case -1:
		case 0:
			var icon = "stop";
		break;
		case 1:
			var icon = "play";
			mixpanel.track("Video play");
		break;
		case 2:
			var icon = "pause";
			mixpanel.track("Video pause");
		break;
		case 3:
			var icon = "refresh";
		break;
	}
	$("#tracks .track").eq(videoNumber).find(".notification.icon-" + icon).show();
};

function playerSetSize() {
	var width = $(player).parent().width();
	$(player).width(width).height(Math.round(getHeightFromWidth(width)));
};

function getHeightFromWidth(width) {
	return Math.round(width / 16 * 9);
};

$(document).keydown(function(e){
	if ($(".search-query").is(":focus")) {
		return true;
	}
	if (e.keyCode == 32) { 
		mixpanel.track("Video paused using spacebar");
		if (player.getPlayerState() == 1)
			player.pauseVideo();
		else
			player.playVideo();
		return false;
	}
	if (e.keyCode == 36 || e.keyCode == 37) { 
		player.previousVideo();
		mixpanel.track("Previous video using arrow key");
		return false;
	}
	if (e.keyCode == 39 || e.keyCode == 40) { 
		player.nextVideo();
		mixpanel.track("Next video using arrow key");
		return false;
	}
});