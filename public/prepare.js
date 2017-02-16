$(function(){
	var $preparePage=$('.prepare');
	var $canvas=$('#canvas');
	var $button=$('#startgame');
	// var $users=$('.users span');
	var $userDiv=$('.users');

	var socket = io();


	$canvas.hide();

	function showUsers(data){
		var list=data.startuser;
		data.usernames.map(function (username){
			addUserElement(username);
		});
		list.map(function (username){
			updateUser(username);
		})
	}

	function addUserElement(username){
		var $user=$('<span/>').text(username);
		$userDiv.append($user);
	}

	function updateUser(username){
		var userspans=$('.users span');
		userspans.map(function(item){
			if($(this).text()===username){
				$(this).css('background-color',"white");
			}
		});
	}

	function addUser(data){
		addUserElement(data.username);
	}

	
	$button.click(function(){
		$button.css("background-color","#8b8b8B");
		$button.text("等待开始");
		socket.emit("start game",{
			username:localStorage.username
		})
	});

// Socket events

	socket.on('one start',function(data){
		updateUser(data.username);
	});

	socket.on('user joined',function(data){
		addUser(data);
	});

	socket.on('login',function(data){
		username=data.username;
		showUsers(data);
	});

	socket.on('started',function(data){
		$preparePage.hide();
		$canvas.show();
	})

});