var userToken, userName, chatsInterval, membersInterval, messagesInterval;

$(document).ready( 
function(){
	getUserToken();
	loadChats();

	$('#leaveChatBtn').bind("click", leaveChat);
	$('#sendMessageBtn').bind("click", sendMessage);
	$('#createChannelBtn').bind("click", createChannel);
	$('#createChannelBtnLink').bind("click", verifyUsernameSet);
	
	chatsInterval = setInterval(loadChats, 3000);
});

function getUserToken() {
	$("#lblResult").addClass("loading");
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/Connect",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function (data){
			userToken = data.d;
		}
	});
}

function loadChats() {
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetChats",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: loadChatsSuccess
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
			}
		}
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
		
		var messageList = $('#messageList');
		messageList.find('li.message').remove();
		getMembers(roomId);
		loadMessages();
		clearInterval(chatsInterval);
		membersInterval = setInterval(getMembers(roomId), 2000);
		messagesInterval = setInterval(loadMessages, 2000);
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
	clearInterval(membersInterval);
	clearInterval(messagesInterval);
	chatsInterval = setInterval(loadChats, 3000);
	loadChats();
}

function getMembers(roomID){
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetPlayers",
		data: '{ chatId : "'+roomID+'"}',
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data) 
		{
			var userList = $('#userList');
			userList.find('li.player').remove();
			$.each(data.d, function(key, member) 
			{
                var entry = $('<li class="player">');
                entry.text(member.PlayerName);
                userList.append(entry);
            });
            userList.listview('refresh');
		}
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
				
				$.each(data.d, function(key, member) 
				{
	                var entry = $('<li class="message">');
	                entry.text(member.Player.PlayerName + ": " + member.Text);
	                messageList.prepend(entry);
	            });
	           		
			}
	});	
}

function sendMessage(){
	var text = $('#messageText').val();	
	if (text !== ""){
		//var messageList = $('#messageList');
		$.ajax({
				type: "POST",
				url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/WriteLine",
				data: '{ playerToken : "' + userToken + '", text: "'+text+'"}',
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(){
					var entry = $('<li class="message">');
		            entry.text(userName + ": " + text);
		            //messageList.prepend(entry);
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

function verifyUsernameSet(){
	if($('#userNameText').val().length){
		$.mobile.changePage($('#CreateChannel'));
	} else{
		$("#errorType").html("username error");
		$("#errorText").html("Your username is empty. Please enter your username.");
		$.mobile.changePage($('#Error'));
	}
}