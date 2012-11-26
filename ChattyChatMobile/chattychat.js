var userToken, userName;

$(document).ready( 
function(){
	getUserToken();
	loadChats();

	$('#leaveChatBtn').bind("click", leaveChat);
	$('#sendMessageBtn').bind("click", sendMessage);
	$('#createChannelBtn').bind("click", createChannel);
});

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
	chatRoomList.find('li.room').remove();
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
			data: '{ playerToken : "' + userToken + '", chatId : "'+roomId +'", userName : "' + userName + '"}',
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		});	
		getMembers(roomId);
		loadMessages();
	});
}

function leaveChat(){
	$.ajax({
			type: "POST",
			url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/LeaveChat",
			data: '{ playerToken : "' + userToken + '"}',
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		});	

	loadChats();
}

function getMembers(roomID){
	var userList = $('#userList');
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetPlayers",
		data: '{ chatId : "'+roomID+'"}',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data) 
		{
			userList.find('li.player').remove();
			$.each(data.d, function(key, member) 
			{
                var entry = $('<li class="player">');
                entry.text(member.PlayerName);
                userList.append(entry);
            });
            userList.listview('refresh');
		},
		error: getUserTokenError
	});
}

function loadMessages(){
	$.ajax({
			type: "POST",
			url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetLinesFrom",
			data: '{ playerToken : "' + userToken + '"}',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data){
				var messageList = $('#messageList');
				messageList.find('li.message').remove();
				$.each(data.d, function(key, member) 
				{
	                var entry = $('<li class="message">');
	                entry.text(member.Player.PlayerName + ": " + member.Text);
	                messageList.prepend(entry);
	                messageList.listview('refresh');
	            });
	           		
			}
		});	
}

function sendMessage(){
	var text = $('#messageText').val();
	
	if (text !== ""){
		var messageList = $('#messageList');
		$.ajax({
				type: "POST",
				url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/WriteLine",
				data: '{ playerToken : "' + userToken + '", text: "'+text+'"}',
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(){
					var entry = $('<li class="message">');
		            entry.text(userName + ": " + text);
		            messageList.prepend(entry);
		           	messageList.listview('refresh');
		           	$('#messageText').val("");
				}
			});	
	}
}

function createChannel(){
	var text = $('#channelText').val();
	if (text !== ""){
		$.ajax({
				type: "POST",
				url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/CreateChannel",
				data: '{ playerToken : "' + userToken + '", channelName: "'+text+'"}',
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data){
					var chatId = data.d;
		            joinChat(text, chatId);
				}
			});
	} else {
		$("#errorType").html("channel creation error");
		$("#errorText").html("channel name is empty. Please specify!");
		$.mobile.changePage($('#Error'));
	}	
}