var _ = require('underscore');
var persist = require('./persist');
var Card = require('./card');
var Player = require('./player');
var readGame = false;

class Game {
  constructor() {
    this.isStarted = false;
    this.players = {};
    this.playerOrder = [];
    this.pile = [];
  }

  addPlayer(username) {
    username = username.trim();
    if (this.isStarted === true) {
      throw new Error("Game already started");
    } else if (!username) {
      throw new Error("must provide username");
    } else if (Object.values(this.players).some((obj) => obj.username === username)) {
      throw new Error("username already exists");
    } else {
      var player = new Player(username);
      this.playerOrder.push(player.id);
      this.players[player.id] = player;
      return player.id;
    }
  }

  startGame() {
    if (this.isStarted === true) {
      throw new Error("Game already started");
    } else if (Object.keys(this.players).length < 2) {
      throw new Error ("game has fewer than 2 people added");
    } else {
      this.isStarted = true;
      // create new deck
      for (var i = 1; i < 14; i++) {
        var card = new Card('spades', i);
        this.pile.push(card);
      }
      for (var i = 1; i < 14; i++) {
        var card = new Card('hearts', i);
        this.pile.push(card);
      }
      for (var i = 1; i < 14; i++) {
        var card = new Card('clubs', i);
        this.pile.push(card);
      }
      for (var i = 1; i < 14; i++) {
        var card = new Card('diamonds', i);
        this.pile.push(card);
      }
      // shuffle
      _.shuffle(this.pile);
      // distribute cards to all players

      while(this.pile.length > 0) {
        for (var key in this.players) {
          if (this.pile.length === 0) {
            break;
          }
          this.players[key].pile.push(this.pile.pop());
        }
      }
    }
  }

  nextPlayer() {

    // Bug here
    //
    // if (this.isStarted === false) {
    //   throw new Error("Game hasn't started");
    // } else {
    //   var player = this.playerOrder.shift();
    //   this.playerOrder.push(player);
    //
    //   if (this.players[this.playerOrder[0]].pile.length === 0) {
    //     this.nextPlayer();
    //   }
    // }

    if(!this.isStarted) {
      throw 'Error: Game has not yet started';
    }


    // An array for comparison
    const playersWith0Cards = [];

    // Loop through all of the players
    // And check if they have 0 cards,
    // Push them to array
    _.each(this.players, player => {
      if(player.pile.length === 0) {
        playersWith0Cards.push(player.id);
      }
    });
    // Set player order equal to a new array
    // Difference will return an array with all of the unique items from both arrays
    this.playerOrder = _.difference(this.playerOrder, playersWith0Cards);

    // No need to check this anymore. The moment the player order is 1, we have a winner

    // if(this.playerOrder.length === 1) {
    //   const currentPlayer = this.playerOrder.shift();
    //   this.playerOrder.push(currentPlayer);
    // }

    // take the current user add them to the end
    const currentPlayer = this.playerOrder.shift();
    this.playerOrder.push(currentPlayer);

    return this.playerOrder[0];

  }

  isWinning(playerId) {
    if (this.isStarted === false) {
      throw new Error("Game hasn't started");
    }
    console.log("playerOrder!!!", this.playerOrder);

    if(this.playerOrder.length === 1) {
      this.isStarted = false;
      return true;
    }

    if (this.players[playerId].pile.length === 52) {
      this.isStarted = false;
      return true;
    } else {
      return false;
    }

  }

  playCard(playerId) {
    if (this.isStarted === false) {
      throw new Error("Game hasn't started");
    } else if (playerId !== this.playerOrder[0]) {
      throw new Error("Player playing out of turn");
    } else if (this.players[playerId].pile.length === 0) {
      throw new Error("this player has no cards");
    } else {
      var topCard = this.players[playerId].pile.pop(); // last element
      this.pile.push(topCard); // move to the top of the game pile, also last element

      // count number of players with 0 cards
      var numPlayer = Object.keys(this.players).length;
      var count = 0;
      for (var key in this.players) {
        if (this.players[key].pile.length === 0) {
          count++;
        }
      }
      if (numPlayer === count) {
        this.isStarted = false;
        throw new Error("all players ran out of cards -- tie");
      }

      // rotate if game continues
      this.nextPlayer();
      return {
        card: topCard,
        cardString: topCard.toString()
      }
    }
  }

  slap(playerId) {
    console.log("before debugger");
    
    if (this.isStarted === false) {
      throw new Error("Game hasn't started");
    } else {
      var win = false;
      var len = this.pile.length;
      var last = len - 1;
      if (len > 0 && this.pile[last].value === 11) {
        win = true;
      } else if (len > 1 && this.pile[last].value === this.pile[last - 1].value) {
        win = true;
      } else if (len > 2 && this.pile[last].value === this.pile[last - 2].value) {
        win = true;
      }
      if (win) {
        // this.players[playerId].pile = [...this.pile, ...this.players[playerId].pile];

        // add to the back of the player's pile
        this.players[playerId].pile.unshift(...this.pile);
        this.pile = [];

        return {
          winning: this.isWinning(playerId),
          message: 'got the pile!'
        }
      } else {

        // Modified
        var length = this.players[playerId].pile.length;
        // If players pile is no more than 3 cards
        // Take his whole pile and add it to the game pile
        if (length <= 3) {
          var loss = this.players[playerId].pile;
          this.players[playerId].pile = [];
          // Added
          this.pile.unshift(...loss);
          // var loss = this.players[playerId].pile.splice(-3);

          // this player will be removed because he has zero cards now; check for winning
          var otherPlayer = this.nextPlayer();
          if (this.playerOrder.length === 1) {
            // otherPlayer wins
            return {
              winning: this.isWinning(otherPlayer),
              message: 'lost 3 cards!'
            }
          }
        } else {
          // Else remove 3 cards from the player
          var loss = this.players[playerId].pile.splice(-3);
          this.pile.unshift(...loss);
        }
        // Removed
        // else {
        //   // begin 3 elements from the end of the array
        //   var loss = this.players[playerId].pile.splice(-3);
        // }
        // move the pile to the back of the central pile


        return {
          winning: false,
          message: 'lost 3 cards!'
        }
      }
    }
  }

  // PERSISTENCE FUNCTIONS
  fromObject(object) {
    this.isStarted = object.isStarted;

    this.players = _.mapObject(object.players, player => {
      var p = new Player();
      p.fromObject(player);
      return p;
    });

    this.playerOrder = object.playerOrder;

    this.pile = object.pile.map(card => {
      var c = new Card();
      c.fromObject(card);
      return c;
    });
  }

  toObject() {
    return {
      isStarted: this.isStarted,
      players: _.mapObject(this.players, val => val.toObject()),
      playerOrder: this.playerOrder,
      pile: this.pile.map(card => card.toObject())
    };
  }

  fromJSON(jsonString) {
    this.fromObject(JSON.parse(jsonString));
  } 

  toJSON() {
    return JSON.stringify(this.toObject());
  }

  persist() {
    if (readGame && persist.hasExisting()) {
      this.fromJSON(persist.read());
      readGame = true;
    } else {
      persist.write(this.toJSON());
    }
  }
}

module.exports = Game;
