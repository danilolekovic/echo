const fs = require("fs");

let deck = "";
let rawdata = fs.readFileSync("./data/math.json");
let cards = JSON.parse(rawdata)["cards"];
var cardIndex = 0;

var loadDecks = function() {
    fs.readdir("data", function(err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }

      files.forEach(function(file) {
        let contents = fs.readFileSync("./data/" + file);
        let json = JSON.parse(contents);

        $(".decks-list").append("<li><a href=\"#\" class=\"deck-selector\" deck=\"" + file.split(".json")[0] + "\">" + json["name"] + "</a></li>");
        
        $(".deck-selector").on("click", function () {
          deck = $(this).attr("deck");
          selectDeck(deck);
        });
      });
    });
};

var selectDeck = function(deck) {
    rawdata = fs.readFileSync("./data/" + deck + ".json");
    cards = JSON.parse(rawdata)["cards"];
    cardIndex = 0;
    $(".decks").hide();
    $(".cards-done").hide();
    showCard();
};

var showCard = function() {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html(cards[cardIndex]["answer"]);
    $(".card-initial").show();
    $(".card").show();
};

$("#check").on("click", function() {
    $(".card-revealed").show();
});

$(".answer-btn").on("click", function () {
  if (cardIndex + 1 >= cards.length) {
    $(".card-initial").hide();
    $(".card-revealed").hide();
    $(".cards-done").show();
    $(".decks").show();
  } else {
    $(".card-revealed").hide();
    cardIndex++;
    showCard();
  }
});

loadDecks();