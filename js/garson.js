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
socket.on("masaIstegi",function(data){
    $("document").ready(function () {
        $(".masaIstekleri").append('<div class="masaIstegi">'+data.masaNo+" numaralı masa adisyon isteği gönderdi"+' <a href="#" onclick="masaOnayla('+data.masaNo+')'+'">Onayla</a> <br /><a href="#" onclick="masaOnaylama('+data.masaNo+')'+'">Onaylama</a></div>');
    });
});
function login(){
    $(document).ready(function(){
        var username = $("input[name='username']").val();
        var password = $("input[name='password']").val();
        socket.emit("garsonLogin",{"username":username,"password":password});
    });
}
function masaOnayla(masaNo){
    socket.emit("masaOnayla",{"masaNo":masaNo});
}
function masaOnaylama(masaNo){
    socket.emit("masaOnaylama",{"masaNo":masaNo});
}