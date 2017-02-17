var socket = io.connect();

socket.emit("garsonFirstLogin",true);
socket.on("listenGarsonFirstLogin",function(data){
	if(data.login == true){
		$(document).ready(function(){
			$("title").html("Giriş Başarılı");
			$(".garsonGiris").hide();
			$(".garson").show();
		});
	}
	else{
		$(document).ready(function(){
			$("title").html("Giriş Yapın");
			$(".garsonGiris").show();
			$(".garson").hide();
		});
	}
});
function login(){
    $(document).ready(function(){
        var username = $("input[name='username']").val();
        var password = $("input[name='password']").val();
        socket.emit("garsonLogin",{"username":username,"password":password});
    });
}