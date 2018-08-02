$(document).ready(function() {

  // Initially, all the buttons except the join game ones are disabled
  $('#startGame').prop('disabled', true);
  $('#playCard').prop('disabled', true);
  $('#slap').prop('disabled', true);
  $('#restart').hide();

  // Establish a connection with the server
  var socket = io();

  // Stores the current user
  var user = null; 

  socket.on('connect', function() {
    console.log('Connected');

    // hide the loading container and show the main container
    $('.connecting-container').hide();
    $('#restart').hide();
    $('.main-container').show();
    let result = localStorage.getItem('id');
    if (result !== null) {
      // rejoin as the user with current game state
      socket.emit('username', {
        id: result
      });
      $('#startGame').prop('disabled', true);
      $('#playCard').prop('disabled', false);
      $('#slap').prop('disabled', false);
      
    }
  });
  
  socket.on('restart', function (){
    console.log("here restart");
    $('#usernameDisplay').text('');
    $('#joinGame').prop('disabled', false);
    $('#observeGame').prop('disabled', false);
    $('.main-container').show();
    $('.connecting-container').hide();
    $('#restart').hide();
  })


  socket.on('end', function () {
    $('#restart').prop('disabled', false);
    $('#startGame').prop('disabled', true);
    $('#playCard').prop('disabled', true);
    $('#slap').prop('disabled', true);
  })

  socket.on('username', function(data) {
    if (data === false) {
      localStorage.setItem('id', ''); // reset the id in localStorage
      // prompt the user for a username and
      // emit this value under the `username` event to the server
      let result = window.prompt("Enter a username");
      socket.emit('username', result);
      return;
    }
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#startGame').prop('disabled', false);
    $('#usernameDisplay').text('Joined game as ' + data.username);
    // store username and playerId in the user variable so represent an existing playing user
    user = data;
    localStorage.setItem('id', data.id);
  });

  socket.on('playCard', function(data) {
    // "King of Hearts"
    var str = data.cardString;
    var arr = str.split(' ');
    var arr2 = arr.map((str)=> str.charAt(0).toLowerCase() + str.slice(1));
    // 'king_of_hearts.svg'
    var str2 = arr2.join('_') + '.svg';
    $('#card').attr('src', "cards/" + str2);
  });

  socket.on('start', function() {
    $('#startGame').prop('disabled', true);
    $('#playCard').prop('disabled', false);
    $('#slap').prop('disabled', false);

  });

  socket.on('message', function(data) {
    console.log("message event:", data);
    $('#messages-container').text(data);
    // remove the message after 5 secs
    setTimeout(()=>{
      $('#messages-container').text('');
    }, 1000);
  });

  socket.on('clearDeck', function(){
    $('#card').attr('src', '');
  });

  socket.on("updateGame", function(gameState) {
    // If game has started, disable join buttons
    if (gameState.isStarted) {
      $('#joinGame').prop('disabled', true);
      $('#observeGame').prop('disabled', true);

      // If game has started and user is undefined, he or she must be an observer
      if (!user) {
        $('#usernameDisplay').text('Observing game...');
      }
    }

    // Displays the username and number of cards the player has
    if (user) {
      $("#usernameDisplay").text('Playing as ' + user.username);
      $(".numCards").text(gameState.numCards[user.id] || 0);
    }

    // Shows the players who are currently playing
    $(".playerNames").text(gameState.playersInGame);

    // Displays the current player
    if (gameState.isStarted) {
      $(".currentPlayerUsername").text(gameState.currentPlayerUsername + "'s turn");
    } else {
      $(".currentPlayerUsername").text('Game has not started yet.');
    }

    // Displays the number of cards in the game pile
    $("#pileDisplay").text(gameState.cardsInDeck + ' cards in pile');

    $(".num").show();

    // If the game is in a winning state, hide everything and show winning message
    if (gameState.win) {
      $('.main-container').hide();
      $('.connecting-container').text(gameState.win + ' has won the game!');
      $('.connecting-container').show();
      $('#restart').show();
      $('#restart').prop('disabled', false);
    }
    window.state = gameState; // store gameState in global variable window's state in case we need it
  })

  socket.on('disconnect', function() {
    // refresh on disconnect
    window.location = window.location;  // .location is just the url; this is equiavelent to window.location.reload()
  });

  // This handler is called when a player joins an already started game
  socket.on('observeOnly', function() {
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game...');
  })

  // A handler for error messages
  socket.on('errorMessage', function(data) {
    alert(data);
  })


  // Click handlers
  $('#startGame').on('click', function(e) {
    e.preventDefault();
    socket.emit('start', null);
  });

  $('#joinGame').on('click', function(e) {
    e.preventDefault();
    var localId = localStorage.getItem('id');
    if (localId === null) {
      // user has not played yet
      var result = window.prompt("Enter a username");
      socket.emit('username', result);
    } else {
      socket.emit('username', {
        id: localId
      });
    }



  });

  $('#observeGame').on('click', function(e) {
    e.preventDefault();
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    $('#usernameDisplay').text('Observing game..');
  });

  $('#playCard').on('click', function(e) {
    e.preventDefault();
    socket.emit('playCard', null);
  });

  $('#slap').on('click', function(e) {
    e.preventDefault();
    socket.emit('slap', null);
  });

  $('#restart').on('click', function(e) {
    e.preventDefault();
    socket.emit('restart', null);
  });

});
