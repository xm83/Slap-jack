"use strict";

var path = require('path');
var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');

app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));

app.get('/', function(req, res) {
  res.render('index');
});
 
app.get('/rules', function(req, res){
  res.render('rules');
})

var Card = require('./card');
var Player = require('./player');
var Game = require('./game'); 
var game = new Game();
var count = 0; // Number of active socket connections
var winner = null; // Username of winner

io.on('connection', function(socket) {

  if (game.isStarted) {
    // whenever a player joins an already started game, he or she becomes
    // an observer automatically
    socket.emit('observeOnly');
  }
  count++;
  socket.on('disconnect', function () {
    count--;
    if (count === 0) {
      game = new Game();
      winner = null;
    }
  });

  socket.on('restart', function () {
    console.log("heard restart");
    game = new Game();
    winner = null;
    io.emit('restart', null);
  })

  socket.on('username', function(data) {
    if (winner) {
      console.log("should emit end")
      socket.emit('end', null);
      return;
    }
    if (typeof(data) === "string") {
      // new user joining the game
      try {
        socket.playerId = game.addPlayer(data);

        socket.emit('username', {
          id: socket.playerId,
          username: data
        });
        io.emit('updateGame', getGameState());
      }
      catch(err){
        console.error(err);
        socket.emit('errorMessage', err.message);
        return;
      }

    } else if (typeof(data) === "object") {
      if (data === null) {
        // no input yet
        console.log("no user input yet:", data);
        return;
      } else {
        // existing user re-joining
        var id = data.id;
        if (Object.keys(game.players).indexOf(id) > -1) {
          socket.playerId = id;
          socket.emit('username', {
            id: id,
            username: game.players[id].username
          });
          io.emit('updateGame', getGameState()); // broadcast to everyone
        } else {
          // also allows user to have a new username when starting a new game
          socket.emit('username', false);
        }
      }
      

    } else {
      // invalid data
      console.log("wth? data:", data);
    }



  });

  socket.on('start', function() {
    if (winner) {
      
      socket.emit('end', null);
      return;
    }
    if (!socket.playerId) {
      socket.emit('errorMessage', 'You are not a player of the game!');
    } else {
      try {
        game.startGame();
        io.emit('start', null);
        io.emit('updateGame', getGameState());
      }
      catch(err) {
        socket.emit('errorMessage', err.message);
        return;
      }
    }
  });

  socket.on('playCard', function() {
    if (winner) {
      
      socket.emit('end', null);
      return;
    }
    if (!socket.playerId) {
      socket.emit('errorMessage', 'You are not a player of the game!');
    } else {
      try {
        var obj = game.playCard(socket.playerId);
      }
      catch(err) {
        socket.emit('errorMessage', err.message);
        return;
      }
    }

    io.emit('playCard', obj);
    // broadcast to everyone the game state
    io.emit('updateGame', getGameState());
  });

  socket.on('slap', function() {
    if (winner) {
      
      socket.emit('end', null);
      return;
    }
    if (!socket.playerId) {
      socket.emit('errorMessage', 'You are not a player of the game!');
    } else {
      try {
        console.log("running code after slapping");
        // Modified
        var obj = game.slap(socket.playerId);
        console.log("!! object:", obj);
        var state = getGameState();
        console.log("state:", state);
        var userName = state.currentPlayerUsername;
        if (obj.winning && state.playerOrder.length === 1) {
          
          winner = game.players[state.playerOrder[0]].username;
          console.log("weird winner:", winner);

        } else if (obj.winning) {
          winner = userName;
        }
        if (obj.message === 'got the pile!') {
          io.emit('clearDeck');
        } else if (state.playerOrder.length !== 1) {
          console.log("message is lost 3 cards");
          socket.emit('message', "You lost 3 cards!");
          socket.broadcast.emit('message', userName + ' lost 3 cards!');
        } else {
          console.log("idk how to handel this? usrName", userName);
        }


        io.emit('updateGame', getGameState());

      }
      catch(err) {
        socket.emit('errorMessage', err.message);
      }
    }
  });

  function getGameState() {
    // persist the game state
    game.persist();

    var currentPlayerUsername;
    var playersInGame = "";
    var numCards = {}; //an Object with the keys as playerIds and the value as the number of Cards

    for (var key in game.players) {
      numCards[key] = game.players[key].pile.length;
    }
    if (game.isStarted) {
      currentPlayerUsername = game.players[game.playerOrder[0]].username;
    } 
    else {
      currentPlayerUsername = 'Game has not started yet';
    }
    var names = [];
    for (var key in game.players) {
       names.push(game.players[key].username);
    }
    playersInGame = names.join(', ');

    // return an object with 6 different properties
    return {
      isStarted: game.isStarted,
      numCards: numCards,
      currentPlayerUsername: currentPlayerUsername,
      playersInGame: playersInGame,
      playerOrder: game.playerOrder,
      cardsInDeck: game.pile.length,
      win: winner
    }
  }

});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
