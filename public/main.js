$(function(){
	const FADE_TIME = 150; // ms
	const TYPING_TIMER_LENGTH = 400; // ms
	const COLORS = [
	    '#e21400', '#91580f', '#f8a700', '#f78b00',
	    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
	    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];
	// Initialize variables
	var $window=$(window);
	var $usernameInput=$('.usernameInput');
	var $loginPage = $('.login.page'); // The login page
  	var $chatPage = $('.chat.page'); // The chatroom page
  	var $inputMessage = $('.inputMessage'); // Input message input box
  	var $messages = $('.messages'); // Messages area
  	var $userNum = $('.title span');

  	// Prompt for setting a username
	var username;
	var $currentInput = $usernameInput.focus();
	var typing = false;
 	var connected = false;
 	var lastTypingTime;

	var socket = io();

	function modParticipantsMessage(data){
		$userNum.text(data.numUsers);
	}


	function setUsername(){
		username = cleanInput($usernameInput.val().trim());
		console.log("setUsername done "+username);
		if(username){
			$loginPage.fadeOut();
			$chatPage.show();
			$loginPage.off('click');
			$currentInput=$inputMessage.focus();
			
			// Tell the server your username
      		socket.emit('add user', username);
		}
	}

	function sendMessage(){
		console.log("sendMessage");
		var message = $inputMessage.val();
		message = cleanInput(message);
		if(message && connected){
			$inputMessage.val('');
			addChatMessage({
		    	username: username,
		        message: message
		    });
		    // tell server to execute 'new message' and send along one parameter
    		socket.emit('new message', message);
		}
	}

	function addChatMessage(data,options){
		var $typingMessages = getTypingMessages(data);
		options = options || {};
		if($typingMessages.length >0){
			options.fade=false;
			$typingMessages.remove();
		}
		var $usernameDiv=$('<span class="username"/>')
      		.text(data.username)
      		.css('color', getUsernameColor(data.username));
      	var $messageBodyDiv=$('<span class="messageBody"/>').text(data.message);

      	var typingClass = data.typing ? 'typing' : '';

		var $messageDiv=$('<li class="message"/>')
			.data("username",data.username)
			.addClass(typingClass)
			.append($usernameDiv,$messageBodyDiv);
		addMessageElement($messageDiv,options);
	}

	function addChatTyping(data){
		data.typing=true;
		data.message=" is typing";
		addChatMessage(data);
	}

	function removeChatTyping(data){
		getTypingMessages(data).fadeOut(function(){
			$(this).remove();
		});
	}

	function log(message,options){
		var $el = $('<li>').addClass('log').text(message);
    	addMessageElement($el, options);
	}

	function addMessageElement(ele,options){
		$ele=$(ele);
		// Setup default options
	    if (!options) {
	      options = {};
	    }
	    if (typeof options.fade === 'undefined') {
	      options.fade = true;
	    }
	    if (typeof options.prepend === 'undefined') {
	      options.prepend = false;
	    }
		if(options.prepend){
			$messages.prepend($ele);
		}
		else{
			$messages.append($ele);
		}
		if (options.fade) {
	      	$ele.hide().fadeIn(FADE_TIME);
	    }
			
		//对话框滑倒最下方
		$messages[0].scrollTop= $messages[0].scrollHeight;
	}

	function updateTyping(message){
		if (connected) {
			if(!typing){
				typing=true;
				socket.emit("typing");
			}
			lastTypingTime = (new Date()).getTime();
			setTimeout(function(){
				timeInterv=(new Date()).getTime()-lastTypingTime;
				if(typing && timeInterv>=TYPING_TIMER_LENGTH){
					socket.emit("stop typing");
					typing=false;
				}
			},TYPING_TIMER_LENGTH);
		}
	}

	function getTypingMessages(data){
		return $('.typing.message').filter(function(i){
			return $(this).data('username')===data.username;
		});
	}
	// Prevents input from having injected markup
	function cleanInput (input) {
	    return $('<div/>').text(input).text();
	}

	  // Gets the color of a username through our hash function
    // H( Key ) = Key % M  ，其中 ：M <= 基本区长度的最大质数
	function getUsernameColor (username) {
		// Compute hash code
		var hash = 7;
		for (var i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}

	$window.keydown(function(event){
		// Auto-focus the current input when a key is typed
	    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
	      $currentInput.focus();
	    }
		if(event.which === 13){
			if(!username){
				setUsername();
			}
			else{
				sendMessage();
			}
			console.log("keydown enter");
		}
	});

	$inputMessage.on('input',function(){
		updateTyping();
	});
	// Click events

	// Focus input when clicking anywhere on login page
	$loginPage.click(function () {
	   $currentInput.focus();
	});

	// Focus input when clicking on the message input's border
	$inputMessage.click(function () {
	   $inputMessage.focus();
	});

	// Socket events

	socket.on('login',function(data){
		connected=true;
		alert("登陆成功");
		// Display the welcome message
	    var message = "Welcome to Socket.IO Chat – ";
	    log(message, {
	      prepend: true
	    });
	    modParticipantsMessage(data);
	});

	socket.on('user joined',function(data){
		log(data.username + ' joined');
    	modParticipantsMessage(data);
	});

	socket.on('new message',function(data){
		addChatMessage(data);
	})

	socket.on('typing',function(data){
		addChatTyping(data);
	})

	// Whenever the server emits 'stop typing', kill the typing message
	socket.on('stop typing', function (data) {
	    removeChatTyping(data);
	});

	socket.on('user left', function(data){
		removeChatTyping(data);
		log(data.username+" left the room");
		modParticipantsMessage(data);
	});
});