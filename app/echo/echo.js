const fs = require("fs");

let deck = "";
let rawdata = fs.readFileSync("./data/math.json");
let cards = JSON.parse(rawdata)["cards"];
var cardIndex = 0;

var cal = new CalHeatMap();
cal.init({
  itemSelector: "#cal-heatmap",
  domain: "month",
  subDomain: "day",
  data: { },
  start: new Date(2020, 0, 1),
  cellSize: 10,
  range: 12,
  legend: [2, 4, 6, 8]
});

var loadDecks = function() {
    fs.readdir("data", function(err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }

      files.forEach(function(file) {
        let contents = fs.readFileSync("./data/" + file);
        let json = JSON.parse(contents);

        $(".decks").append(
          "<div class=\"deck-card\">" +
          "<h2><a href=\"#\" class=\"deck-selector\" deck=\"" + file.split(".json")[0] + "\">" + json["emoji"] + " " + json["name"] + "</a></h2>" +
          "</div>"
        );
        
        $(".deck-selector").on("click", function() {
          deck = $(this).attr("deck");
          selectDeck(deck);
        });
      });
    });
};

var deckComplete = function() {
  alert("Deck completed!");
  $(".card-initial").hide();
  $(".card-revealed").hide();
  $(".card").hide();
  $(".cards-done").hide();
  $(".decks").show();
  $("#heatmap").show();
  $(".decks-header").show();
};

var nextCard = function() {
  if (cardIndex + 1 >= cards.length) {
    deckComplete();
    cardIndex = 0;
  } else {
    $(".card-revealed").hide();
    cardIndex++;
    $(".card-count").html(
      '<span id="card-now"><span id="card-now-dot">&middot;</span>' +
        (cardIndex + 1) +
        '</span><span id="card-total">/' +
        cards.length +
        "</span>"
    );

    showCard();
  }
};

var prepareFlip = function() {
    $(".card-answer-btns").html(
      '<a href="#" class="answer-btn" id="easy">Easy</a><a href="#" class="answer-btn" id="good">Good</a><a href="#" class="answer-btn" id="hard">Hard</a>'
    );

  $(".answer-btn").on("click", function () {
    if (cardIndex + 1 >= cards.length) {
      deckComplete();
      cardIndex = 0;
    } else {
      $(".card-revealed").hide();
      cardIndex++;
      $(".card-count").html(
        '<span id="card-now"><span id="card-now-dot">&middot;</span>' +
          (cardIndex + 1) +
          '</span><span id="card-total">/' +
          cards.length +
          "</span>"
      );
      showCard();
    }
  });
};

var prepareChoice = function() {
  let builder = "";

  cards[cardIndex]["choices"].forEach(function(item) {
    builder +=
      '<a href="#" class="answer-btn-choice">' + item + "</a>";
  });

  $(".card-answer-btns").html(builder);

  $(".answer-btn-choice").on("click", function(e) {
    if ($(this).html().toLowerCase() == cards[cardIndex]["answer"]) {
      // change this to class
      $(this).css("background-color", "#2ECC40");
      e.preventDefault();
      setTimeout(nextCard, 500);
    } else {
      e.preventDefault();

      // change this to class
      $(this).css("background-color", "#FF4136");
      $(this).css("color", "#FFFFFF");
    }
  });
};

var prepareBool = function () {
  $(".card-answer-btns").html(
    '<a href="#" class="answer-btn-bool">True</a><a href="#" class="answer-btn-bool">False</a>'
  );

  $(".answer-btn-bool").on("click", function (e) {
    if ($(this).html() == cards[cardIndex]["answer"]) {
      // change this to class
      $(this).css("background-color", "#2ECC40");
      e.preventDefault();
      setTimeout(nextCard, 500);
    } else {
      e.preventDefault();

      // change this to class
      $(this).css("background-color", "#FF4136");
      $(this).css("color", "#FFFFFF");
    }
  });
};

var prepareEnter = function() {
  $(".card-answer-btns").html(
    '<input type="text" id="card-answer" name="card-answer">'
  );

  $("#card-answer").on("keyup", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      if ($(this).val().toLowerCase() == cards[cardIndex]["answer"]) {
        // change this to class
        $(this).css("border-bottom-color", "#2ECC40");
        e.preventDefault();
        setTimeout(nextCard, 500);
      } else {
        // change this to class
        $(this).css("border-bottom-color", "#FF4136");
      }
    }
  });
};

var selectDeck = function(deck) {
    rawdata = fs.readFileSync("./data/" + deck + ".json");
    cards = JSON.parse(rawdata)["cards"];
    $(".card-count").html("<span id=\"card-now\"><span id=\"card-now-dot\">&middot;</span>" + (cardIndex + 1) + "</span><span id=\"card-total\">/" + cards.length + "</span>");
    cardIndex = 0;
    $(".decks").hide();
    $("#heatmap").hide();
    $(".decks-header").hide();
    $(".cards-done").hide();
    showCard();
};

var showCard = function() {
  if (cards.length == 0) {
    alert("This deck is empty.");
    $(".card-initial").hide();
    $(".card-revealed").hide();
    $(".card").hide();
    $(".cards-done").hide();
    $(".decks").show();
    $("#heatmap").show();
    $(".decks-header").show();
  } else if (cards[cardIndex]["type"] == "flip") {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html(cards[cardIndex]["answer"]);
    $(".card-initial").show();
    $(".card").show();
    $("#check").show();
    $(".card-revealed").hide();
    prepareFlip();
  } else if (cards[cardIndex]["type"] == "choice") {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html("");
    $(".card-initial").show();
    $(".card").show();
    $("#check").hide();
    $(".card-revealed").show();
    prepareChoice();
  } else if (cards[cardIndex]["type"] == "enter") {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html("");
    $(".card-initial").show();
    $(".card").show();
    $("#check").hide();
    $(".card-revealed").show();
    prepareEnter();
  } else if (cards[cardIndex]["type"] == "bool") {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html("");
    $(".card-initial").show();
    $(".card").show();
    $("#check").hide();
    $(".card-revealed").show();
    prepareBool();
  }
};

$("#check").on("click", function() {
    $(".card-revealed").show();
});

$(".go-back").on("click", function() {
    $(".card-initial").hide();
    $(".card-revealed").hide();
    $(".cards-done").hide();
    $(".card").hide();
    $(".decks").show();
    $("#heatmap").show();
    $(".decks-header").show();
    cardIndex = 0;
});

$(".answer-btn").on("click", function () {
  nextCard();
});

loadDecks();