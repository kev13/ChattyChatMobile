var userToken, userName, nameValidated = false;

function Init(){
	getUserToken();
	loadChats();
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

function getUserToken() {
	$("#lblResult").addClass("loading");
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/Connect",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: getUserTokenSuccess,
		error: getUserTokenError
	});
}

function getUserTokenSuccess(data, status) {
	userToken = data.d;
	/*
	$("#lblResult").removeClass("loading");
	$("#lblResult").html(data.d);
	*/
}

function getUserTokenError(request, status, error) {
/*
	TODO: Error handling
	$("#lblResult").removeClass("loading");
	$("#lblResult").html(request.statusText);
*/
}

function loadChats() {
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetChats",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: loadChatsSuccess,
		error: loadChatsError
	});	
}

function loadChatsSuccess(data, status) {
	var chatRoomList = $('#chats');
	$.each(data.d, function(key, room) {
                var entry = $('<li class="room">'), link = $('<a>'), counter = $('<span class="ui-li-count">');
                link.click(function() {
                    joinChat(room.Name, room.Id);
                });
                link.text(room.Name);
                counter.text(room.Players.length);
                entry.append(link);
                entry.append(counter);
                chatRoomList.append(entry);
            });
            chatRoomList.listview('refresh');
}

function loadChatsError(request, status, error) {
	/* TODO: Error handling */
}

function isNameUnique(callback){
	userName = $('#userNameText').val();
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/IsNameUnique",
		data: '{ name : "' + userName + '" }',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(isUniqueName){
			if(isUniqueName){
				if(userName.length){
					callback();
				}else{
					$("#errorType").html("username error");
					$("#errorText").html("Your username is empty. Please enter your username.");
					$.mobile.changePage($('#Error'));
				}			
			}else{
				$("#errorType").html("username error");
				$("#errorText").html("Your username is not unique. Please try again with a different one.");
				$.mobile.changePage($('#Error'));
				/* TODO: Error handling */
			}
		},
		error: function (args) { alert("error"); } 
	});
}

function joinChat(roomName, roomId){
	isNameUnique(function() {
		$.mobile.changePage($('#Chat'));
		$("#chatName").html(roomName);
		$("#msgLabel").html("Enter your Message (" + userName + " says): ");
		$.ajax({
			type: "POST",
			url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/JoinChat",
			data: '{ playerToken : "' + userToken + '", chatId : ' + roomId + ', userName : "' + userName + '"}',
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		});	
		
	});
}

window.onload = Init;