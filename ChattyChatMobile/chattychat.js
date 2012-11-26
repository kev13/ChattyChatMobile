var userToken, userName;

function Init(){
	GetUserToken();
	LoadChats();
}

function callService(methodName, callback, parameter){
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/" + methodName,
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: GetUserTokenSuccess,
		error: Error
	});
}

function GetUserToken() {
	$("#lblResult").addClass("loading");
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/Connect",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: GetUserTokenSuccess,
		error: Error
	});
}

function GetUserTokenSuccess(data, status) {
	userToken = data.d;
	/*
	$("#lblResult").removeClass("loading");
	$("#lblResult").html(data.d);
	*/
}

function Error(request, status, error) {
/*
	TODO: Error handling
	$("#lblResult").removeClass("loading");
	$("#lblResult").html(request.statusText);
*/
}

function LoadChats() {
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetChats",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: LoadChatsSuccess,
		error: Error2
	});	
}

function LoadChatsSuccess(data, status) {
	var chatRoomList = $('#chats');
	$.each(data.d, function(key, room) {
                var entry = $('<li class="room">'), link = $('<a>'), counter = $('<span class="ui-li-count">');
                /*link.click(function() {
                    joinChat(room.Name, room.Id);
                });*/
                link.text(room.Name);
                counter.text(room.Players.length);
                entry.append(link);
                entry.append(counter);
                chatRoomList.append(entry);
            });
            chatRoomList.listview('refresh');
}

function Error2(request, status, error) {
	$("#blub").removeClass("hullahulla");
	$("#blub").html("aaaa");
}

window.onload = Init;