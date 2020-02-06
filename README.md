# 🃏 Slap!jack 🃏
Welcome to the one-and-only multiplayer card game _Slapjack_!

You will need at least 2 players to start a game. Invite friends to play with you by sending them the heroku website link: https://safe-woodland-73241.herokuapp.com/! (Alternatively, you could open two browser windows, one incognito, to pretend like you're two different people)

## Usage :page_with_curl:
Navigating this game app is really intuitive. You will be guided to enter your username, and then you can choose to join a game as a player or an observer (which means you can't do anything other than watching - _you can only be an observer if you join an already started game_). The 'Start Game' button will be enabled as soon as there are at least 2 players. 

Once game is started, each player will play a card in turn by pressing the 'Play Card' button; you will be warned and stopped if you try to play out of turn. You can slap the pile at any time by pressing the 'Slap' button. If you're the fastest to slap, you will be alerted the consequence of your action (winning / losing), and other players will be notified of that consequence too!

When the game ends, everyone will be notified of the winner, and you can choose to restart the game. You'll have the option of choosing another username, or sticking with your old one.

Any time you are unsure about the rules, you can view the rules by clicking the 'Rules' button. 

Note that during the game, you will only be able to see the top card in the pile. Time to use your awesome working memory and your fast reaction to conquer the kingdom of Slapjack!

## Technical Accomplishments :tada:
* Designed a **competitive multiplayer (2+)** card game that allows players to make special moves out of turn, based on logic of Slapjack

* Achieved 2-way **real-time communication** between server and clients through **socket.io**

* Built realtime backend with **NodeJS** and **ExpressJS** that maintains game state and validates game moves according to rules

* Implemented game interface with **Handlebars**, **Bootstrap**, and **jQuery**, and deployed game server on **Heroku**

## Rules of Slapjack :page_with_curl:

In Slapjack, the objective of the game is to win the entire deck of cards (52 cards).

At the beginning of a game of Slapjack, each player is dealt an equal number of cards facedown (players are not able to see their own cards or anyone else's cards).

> If the number of players does not divide 52, then a few players might get additional cards. For example, players in a 3-player game will have 17, 17, and 18 cards.

Players will then go in order, playing the top card in their deck to the top of the pile until somebody reaches 52 cards (_the winning condition of the game_).

At any time, players can gain cards by "slapping" the pile - in which case they either gain the pile or lose 3 cards based on the following conditions:

* If the top card of the pile is a Jack, the player gains the pile
* If the top two cards of the pile are of the same value (i.e., two Aces, two 10's, two 2's), the player gains the pile
* If the top card and third-to-top card are of the same value (sandwich - i.e. (Ace-10-Ace), (7-Queen-7)), the player gains the pile
* Otherwise, the player loses 3 cards on top of his or her pile to the **bottom** of the central pile

Players can slap the pile even when it is not their turn.

If multiple players slap the pile in close succession, all players except the first one lose 3 cards. The first player to slap will win or lose cards based on the conditions listed above.

