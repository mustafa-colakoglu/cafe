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
var masaBl = new masaBl(io);

var garsonBl = new garsonBl(io);

io.sockets.on("connection",function(socket){
	socket.on("firstLogin",function(data){
		var ip = socket.handshake.address;
		connect.query("SELECT * FROM masalar WHERE doluMu='1' and ip="+mysql.escape(ip),function(error,result){
			if(error == null){
				if(result.length > 0){
					io.to(socket.id).emit("listenFirstLogin",{"login":true});
				}
				else{
					io.to(socket.id).emit("listenFirstLogin",{"login":false});
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
	    console.log(data);
        var ip = socket.handshake.address;
        var username = mysql.escape(data.username);
        var password = mysql.escape(md5(data.password));
        connect.query("SELECT * FROM garsonlar WHERE username="+username+" and password="+password,function (error,result) {
            console.log(result.length)
        });
    });
});

app.get("/garson",function(req,res){
	res.sendFile(__dirname+"/pages/garson.html");
});

app.get("/",function(req,res){
	res.sendFile(__dirname+"/pages/use.html");
});