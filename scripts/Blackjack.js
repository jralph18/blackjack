const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const suits = ['H', 'S', 'D', 'C'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const cardWidth = 225;
const cardHeight = 315;

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
    draw(coordX, coordY){
        const image = new Image();
        image.onload = drawCard; 
        image.src = 'images/cards2.png';
        let tileX = ranks.indexOf(this.rank) * cardWidth;
        let tileY = suits.indexOf(this.suit) * cardHeight;
        function drawCard() {
            ctx.drawImage(this, tileX, tileY, cardWidth, cardHeight, coordX, coordY, cardWidth * 0.6, cardHeight * 0.6  );
        }
    }
    drawBack(coordX, coordY){
        const image = new Image();
        image.onload = drawCard; 
        image.src = 'images/cardBack.png';
        let tileX = ranks.indexOf(this.rank) * cardWidth;
        let tileY = suits.indexOf(this.suit) * cardHeight;
        function drawCard() {
            ctx.drawImage(this, coordX, coordY, cardWidth * 0.6, cardHeight * 0.6  );
        }
    }
}

class Deck {
    constructor(){
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
    length(){
        return this.deck.length;
    }
}

class Hand {
    constructor(type){
        this.cards = [];
        this.type = type;
        if (type === 'dealer') {
            this.pos = 0;
            this.firstHidden = true;
        }else {
            this.pos = 1;
            this.firstHidden = false;
        }
    }
    addCard(card){
        this.cards.push(card);
        this.draw(card);
    }
    draw(card=this.cards[0]){
            if(this.type === 'dealer' && this.firstHidden) {
                card.drawBack(this.cards.indexOf(card) * 0.6 * cardWidth + 20, this.pos * cardHeight + 20);
                this.firstHidden = false;
            } else{
                card.draw(this.cards.indexOf(card) * 0.6 * cardWidth + 20, this.pos * cardHeight + 20);
            }
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
    reset() {
        this.cards = [];
        if(this.type === 'dealer') this.firstHidden = true;
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
    constructor(){
        this.numCards = 2;
        this.bet = 0;
        this.wallet = 2000;
        this.updateWallet();
        this.dealer = new Hand("dealer");
        this.player = new Hand("player");
        this.deck = new Deck();
        this.deck.shuffle();
        this.paused = false;
    }
    deal() {
        if(this.inPlay || this.paused) return;

        document.getElementById("betting").classList.toggle("hidden");
        document.getElementById("actions").classList.toggle("hidden");
        this.inPlay = true;

        for(let i=0; i<this.numCards; i++){
            this.player.addCard(this.deck.dealCard());
            this.dealer.addCard(this.deck.dealCard());
        }
    }
    hit() {
        if(!this.inPlay || this.paused) return;
        this.player.addCard(this.deck.dealCard());
        if(this.player.getValue() > 21) {
            let that = this;
            setTimeout(() => {
                that.inPlay = false;
                that.wallet -= that.bet;
                that.displayResult("You lost $" + that.bet);
            }, 500);
        }
    }
    stand() {
        if(!this.inPlay || this.paused) return;
        let outcome = null;
        this.dealer.draw();
        while(this.dealer.getValue() < 17) {
            this.dealer.addCard(this.deck.dealCard());
        }
        if(this.dealer.getValue() > 21) {
            outcome = "You won $" + this.bet;
            this.wallet += this.bet;
        } else if(this.player.getValue() > this.dealer.getValue()){
            outcome = "You won $" + this.bet;
            this.wallet += this.bet;
        } else if(this.player.getValue() === this.dealer.getValue()){
            outcome = "Push"
        } else {
            outcome = "You lost $" + this.bet;
            this.wallet -= this.bet;
        }
        this.inPlay = false;
        this.displayResult(outcome);
    }
    betClick(event) {
        if(this.inPlay || this.paused) return;
        console.log(Number(event.value));
        this.bet += Number(event.value);
        this.updateWallet();
    }
    updateWallet() {
        document.getElementById('wallet').innerHTML = "Wallet: $" + this.wallet;
        document.getElementById('bet').innerHTML = "Bet: $" + this.bet;
    }
    displayResult(outcome) {
        let that = this;
        let overlay = document.getElementById("overlay");
        overlay.innerHTML = outcome;
        overlay.classList.toggle('overlay');
        overlay.addEventListener('click', () => {
            overlay.classList.toggle('overlay');
            that.updatePanel();
            that.checkDeck();
        });
    }
    updatePanel() {
        let that = this;
        this.paused = true;
        this.bet = 0;
        this.updateWallet();
        this.player.reset();
        this.dealer.reset();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById("betting").classList.toggle("hidden");
        document.getElementById("actions").classList.toggle("hidden");
        that.paused = false;
    }
    checkDeck(){
        if(this.deck.length() < 7) {
            let that = this;
            this.paused = true;
            this.deck = new Deck();
            this.deck.shuffle();
            document.getElementById('shuffle').innerHTML = "Shuffling...";
            setTimeout(() => {
                document.getElementById('shuffle').innerHTML = "";
                that.paused = false;
            }, 2000);
        }
    }
    printStatus(){
        console.log("Dealer: " + this.dealer.toString());
        console.log("Player: " + this.player.toString());
    }
}

const game = new Blackjack();