var express = require("express");
var md5 = require('md5');
var app = express();
var ip = require('ip');

app.use("/js",express.static(__dirname+"/js"));
app.use("/css",express.static(__dirname+"/css"));
app.use("/pages",express.static(__dirname+"/pages"));

var server = app.listen(83);

var io = require("socket.io").listen(server);

var mysql = require("mysql");
var connect = mysql.createConnection({
	"host":"127.0.0.1", // localhost olmaz
	"user":"root",
	"password":"",
	"database":"cafe",
	"port":3306
});
connect.connect();
connect.query("UPDATE garsonlar SET status='0',socketId='0',ip='0'");
function masaNode(){
	this.masaNo = "";
	this.socketId = "";
	this.ip = "";
	this.next = undefined;
}

function masaBl(socket){
    this.socket = socket;
	this.root = undefined;
	this.last = undefined;
	this.length = 0;
	this.insert = function(masaNo,socketId,ip){
		var newMasaNode = new masaNode();
		newMasaNode.masaNo = masaNo;
		newMasaNode.socketId = socketId;
		newMasaNode.ip = ip;
		if(this.root == undefined){
			this.root = newMasaNode;
			this.last = newMasaNode;
		}
		else{
			this.last.next = newMasaNode;
			this.last = newMasaNode;
		}
		this.length++;
	}
    this.del = function(socketId){
        if(this.root.socketId == socketId){
            this.root = this.root.next;
        }
        else{
            var temp = this.root.next;
            var prev = this.root;
            while(temp != undefined){
                if(temp.socketId == socketId){
                    prev.next = temp.next;
                }
                prev = temp;
                temp = temp.next;
            }
        }
        this.length--;
    }
    this.getFromMasaNo = function(masaNo){
        var temp = this.root;
        while(temp != undefined){
            if(temp.masaNo == masaNo){
                return temp;
            }
            temp = temp.next;
        }
        return false;
    }
    this.edit = function(socketId,newSocketId){
        var temp = this.root;
        while(temp != undefined){
            if(temp.socketId == socketId){
                temp.socketId = newSocketId;
                break;
            }
            temp = temp.next;
        }
    }
    this.sendAll = function(variableName,data){
        var temp = this.root;
        while(temp != undefined){
            this.socket.to(temp.socketId).emit(variableName,data);
            temp = temp.next;
        }
    }
}

function garsonNode(){
	this.username = "";
	this.socketId = "";
	this.ip = "";
	this.next = undefined;
}

function garsonBl(socket){
    this.socket = socket;
	this.root = undefined;
	this.last = undefined;
	this.length = 0;
	this.insert = function(username,socketId,ip){
		var newGarsonNode = new garsonNode();
		newGarsonNode.username = username;
		newGarsonNode.socketId = socketId;
		newGarsonNode.ip = ip;
		if(this.root == undefined){
			this.root = newGarsonNode;
			this.last = newGarsonNode;
		}
		else{
			this.last.next = newGarsonNode;
			this.last = newGarsonNode;
		}
		this.length++;
	}
	this.del = function(socketId){
	    if(this.root.socketId == socketId){
            this.root = this.root.next;
        }
        else{
	        var temp = this.root.next;
	        var prev = this.root;
	        while(temp != undefined){
	            if(temp.socketId == socketId){
                    prev.next = temp.next;
                }
                prev = temp;
	            temp = temp.next;
            }
        }
        this.length--;
    }
    this.edit = function(socketId,newSocketId){
        var temp = this.root;
        while(temp != undefined){
            if(temp.socketId == socketId){
                temp.socketId = newSocketId;
                break;
            }
            temp = temp.next;
        }
    }
    this.sendAll = function(variableName,data){
        var temp = this.root;
        while(temp != undefined){
            this.socket.to(temp.socketId).emit(variableName,data);
            temp = temp.next;
        }
    }
    this.sendOthers = function(socketId,variableName,data){
        var temp = this.root;
        while(temp != undefined){
            if(temp.socketId != socketId) {
                this.socket.to(temp.socketId).emit(variableName, data);
            }
            temp = temp.next;
        }
    }
    this.issetSocketId = function(socketId){
        var temp = this.root;
        while(temp != undefined){
            if(temp.socketId == socketId){
                return true;
            }
            temp = temp.next;
        }
        return false;
    }
}
var masalar = new masaBl(io);
var geciciMasalar = new masaBl(io);
var garsonlar = new garsonBl(io);

io.sockets.on("connection",function(socket){
	socket.on("masafirstLogin",function(data){
		var ip = socket.handshake.address;
		connect.query("SELECT * FROM masalar WHERE status='1' and ip="+mysql.escape(ip),function(error,result){
			if(error == null){
				if(result.length > 0){
					io.to(socket.id).emit("listenMasaFirstLogin",{"login":true});
				}
				else{
					io.to(socket.id).emit("listenMasaFirstLogin",{"login":false});
				}
			}
			else{
				console.log(error);
			}
		});
	});
	socket.on("garsonFirstLogin",function(data){
		var ip = socket.handshake.address;
		connect.query("SELECT * FROM garsonlar WHERE ip="+mysql.escape(ip),function(error,result){
			if(error == null){
				if(result.length > 0){
				    io.to(socket.id).emit("listenGarsonFirstLogin",{"login":true});
                    garsonlar.edit(result[0]["socketId"],socket.id);
                }
                else{
                    io.to(socket.id).emit("listenGarsonFirstLogin",{"login":false});
                }
			}
			else{
				console.log(error);
			}
		});
	});
	socket.on("garsonLogin",function(data){
        var ip = socket.handshake.address;
        var username = mysql.escape(data.username);
        var password = mysql.escape(md5(data.password));
        connect.query("SELECT * FROM garsonlar WHERE username="+username+" and password="+password,function (error,result) {
            if(result.length > 0){
                connect.query("UPDATE garsonlar SET ip="+mysql.escape(ip)+",socketId="+mysql.escape(socket.id)+", status='1' WHERE id='"+result[0]["id"]+"'");
                io.to(socket.id).emit("listenGarsonFirstLogin",{"login":true});
                garsonlar.insert(username,socket.id,ip);
            }
            else{
                io.to(socket.id).emit("listenGarsonFirstLogin",{"login":false});
            }
        });
    });
	socket.on("masaLogin",function (data) {
        var masaNo = data.masaNo;
        var ip = socket.handshake.address;
        var socketId = socket.id;
        connect.query("SELECT * FROM masalar WHERE masaNo="+mysql.escape(masaNo)+" and ip="+mysql.escape(ip)+" and status='0'",function (error,result) {
            garsonlar.sendAll("masaIstegi",{"masaNo":masaNo});
            geciciMasalar.insert(masaNo,socketId,ip);
        });
    });
	socket.on("masaCevapla",function (data) {
        var masaNo = data.masaNo;
        var cevap = data.cevap;
        var ip = socket.handshake.address;
        var socketId = socket.id;
        if(garsonlar.issetSocketId(socket.id)){
            garsonlar.sendOthers("masaCevaplandi",{"masaNo":masaNo});
            var masa = geciciMasalar.getFromMasaNo(masaNo);
            if(masa != false) {
                if (cevap == 0) {
                    io.to(masa.socketId).emit("masaLoginCevap",{"cevap":0,"menu":{}});
                }
                else{
                    connect.query("UPDATE masalar SET status='1',socketId="+mysql.escape(socketId)+",ip="+mysql.escape(ip)+",masaNo='"+masaNo+"' WHERE masaNo='"+masaNo+"'");
                    connect.query("SELECT * FROM urunler",function (error,result) {
                        if(error == null){
                            io.to(masa.socketId).emit("masaLoginCevap",{"cevap":1,"menu":result});
                        }
                        else{
                            console.log(error);
                        }
                    });
                }
                geciciMasalar.del(masa.socketId);
            }
        }
    });
});

app.get("/garson",function(req,res){
	res.sendFile(__dirname+"/pages/garson.html");
});

app.get("/",function(req,res){
	res.sendFile(__dirname+"/pages/use.html");
});