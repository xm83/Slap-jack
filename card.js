class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;

  }

  toString() {
    var cardMap = {
      "1": "Ace",
      "11": "Jack",
      "12": "Queen",
      "13": "King"
    }
    var cardValue = this.value;
    var cardValue2 = cardMap[String(cardValue)] || String(cardValue);
    var cardSuit = this.suit;
    var cardSuit2 = cardSuit.charAt(0).toUpperCase() + cardSuit.slice(1);

    return cardValue2 + " of " + cardSuit2;


  }

  // PERSISTENCE FUNCTIONS save game state to
  // a store.json file
  fromObject(object) {
    this.value = object.value;
    this.suit = object.suit;
  }

  toObject() {
    return {
      value: this.value,
      suit: this.suit
    };
  }
}
 
module.exports = Card;
