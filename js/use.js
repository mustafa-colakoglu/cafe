var socket = io.connect();

function session(){
	this.siparisler = new Array();
}
var session = new session();
socket.emit("firstLogin",true);
socket.on("listenFirstLogin",function(data){
	if(data.login == true){
		$(document).ready(function(){
			$("title").html("Sipariş verebilirsiniz");
			$(".giris").hide();
			$(".siparis").show();
		});
	}
	else{
		$(document).ready(function(){
			$("title").html("Sipariş verebilmek için giriş yapın");
			$(".giris").show();
			$(".siparis").hide();
		});
	}
});