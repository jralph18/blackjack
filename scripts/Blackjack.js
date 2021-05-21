// import Card from "Card.js";
class Card {
    constructor(suit, rank){
        this.suit = suit;
        this.rank = rank;
    }

    getSuit(){
        return this.suit;
    }
    getRank(){
        return this.rank;
    }
    toString(){
        return this.rank + this.suit;
    }
}

class Deck {
    constructor(){
        const suits = ['C', 'D', 'H', 'S'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.deck.push(new Card(suit, rank));
            });
        });
    }
    strDeck(){
        return this.deck;
    }
    shuffle(){
        this.deck.sort(() => Math.random() - 0.5);
    }
    dealCard(){
        return this.deck.pop();
    }
}

class Hand {
    constructor(){
        this.cards = [];
    }
    addCard(card){
        this.cards.push(card);
    }
    getValue(){
        let value = 0;
        let aces = false;
        this.cards.forEach(card => {
            if(card.getRank() === 'J' || card.getRank() === 'Q' || card.getRank() === 'K'){
                value += 10;
            }else if(card.getRank() === 'A'){
                value += 1;
                aces = true;
            }else {
                value += Number(card.getRank());
            }
        });
        if(aces && value + 10 <= 21){
            value += 10;
        }
        return value;
    }
    toString(){
        let cardStr = "";
        this.cards.forEach(card => {
            cardStr += card.toString() + " ";
        })
        return cardStr;
    }
}

class Blackjack {
    constructor(numPlayers, numDecks){
        this.numPlayers = numPlayers;
        this.numDecks = numDecks;
        this.numCards = 2;
        this.deal();
    }
    deal() {
        this.inPlay = true;
        this.dealer = new Hand();
        this.player = new Hand();
        this.deck = new Deck();
        this.deck.shuffle();
        for(let i=0; i<this.numCards; i++){
            this.player.addCard(this.deck.dealCard());
            this.dealer.addCard(this.deck.dealCard());
        }
        this.printStatus();
    }
    hit() {
        if(!this.inPlay) return;
        this.player.addCard(this.deck.dealCard());
        this.printStatus();
        if(this.player.getValue() > 21) {
            this.inPlay = false;
            console.log("Bust! You lose!");
        }
    }
    stand() {
        if(!this.inPlay) return;
        let outcome = null;
        while(this.dealer.getValue() < 17) {
            this.dealer.addCard(this.deck.dealCard());
        }
        this.printStatus();
        if(this.dealer.getValue() > 21) {
            outcome = "Dealer busts. You win!";
        } else if(this.player.getValue() > this.dealer.getValue()){
            outcome = "You win!";
        } else {
            outcome = "Dealer wins."
        }
        this.inPlay = false;
        console.log(outcome);
    }
    reset(){
        this.deal();
    }
    printStatus(){
        console.log("Dealer: " + this.dealer.toString());
        console.log("Player: " + this.player.toString());
    }
}

const game = new Blackjack(1, 1);