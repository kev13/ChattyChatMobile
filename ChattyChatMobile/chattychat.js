var userToken;


function Init(){
			GetUserToken();
			/*LoadChats();*/
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
	$("#blub").addClass("hullahulla");
	$.ajax({
		type: "POST",
		url: "http://sifsv-80018.hsr.ch/Service/ChatService.asmx/GetChats",
		data: "{}",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: LoadChatsSuccess,
		error: Error
	});	
}

function LoadChatsSuccess(data, status) {
	$("#blub").removeClass("hullahulla");
	$("#blub").html(data.d);
}

window.onload = Init;