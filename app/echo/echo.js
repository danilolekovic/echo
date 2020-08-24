const fs = require("fs");
const readline = require("readline");

// default data
let deck = "";
let rawdata = fs.readFileSync("./data/math.json");
let cards = JSON.parse(rawdata)["cards"];
var cardIndex = 0;

/* deck functions */

// loads decks
var loadDecks = function() {
  let echoData = require("./db/echo.json");

  var cal = new CalHeatMap();
  cal.init({
    itemSelector: "#cal-heatmap",
    domain: "month",
    subDomain: "day",
    data: echoData["heatmap"],
    start: new Date(2020, 0, 1),
    cellSize: 10,
    range: 8,
    legend: [2, 4, 6, 8],
  });

  fs.readdir("data", function(err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    files.forEach(function(file) {
      let contents = fs.readFileSync("./data/" + file);
      let json = JSON.parse(contents);

      $(".decks").prepend(
        '<div class="deck-card">' +
          '<h2 class="deck-selector-head"><a href="#" class="deck-selector" deck="' +
          file.split(".json")[0] +
          '">' +
          json["emoji"] +
          " " +
          json["name"] +
          "</a></h2><hr>" +
          "<p><i class=\"gg-align-bottom\"></i> Contains <span style='color:#2ECC40'><span style='color:#0074D9'>" +
          json["cards"].length +
          "</span> cards</p>" +
          "<p><i class=\"gg-bolt\"></i> Your retention rate is <span style='color:#2ECC40'>100%</span></p>" +
          "<hr><p><i class=\"gg-open-collective\"></i> <a href='#'>Study</a> &middot; " +
          "<a href='#'>Cram</a> &middot; " +
          "<a href='#'>Quiz</a></p>" +
          "</div>"
      );
      
      $(".deck-selector").on("click", function() {
        deck = $(this).attr("deck");
        selectDeck(deck);
      });
    });
  });
};

// when the deck is completed
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

// saves usage in heatmap data
var saveHeatmap = function() {
  let echoData = require("./db/echo.json");
  
  var currentDate = Math.floor(
    new Date().setHours(0, 0, 0, 0) / 1000
  ).toString();

  if (echoData["heatmap"].hasOwnProperty(currentDate)) {
    echoData["heatmap"][currentDate] = echoData["heatmap"][currentDate] + 1;
  } else {
    echoData["heatmap"][currentDate] = 1;
  }

  fs.writeFileSync("./db/echo.json", JSON.stringify(echoData));
};

// goes to next card
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

    saveHeatmap();
  }
};

// preparations for flip cards
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

// preparations for cloze deletion cards
var prepareCloze = function() {
  var regexp = /{{c([1-9]+)::(.*?)}}/g;
  var answered = 0;
  var clozes = 0;

  $(".card-question").html(
    cards[cardIndex]["question"].replace(
      regexp,
      '<input type="text" class="card-answer-cloze" name="card-answer" answered="false" answer="$2">'
    )
  );

  clozes = cards[cardIndex]["question"].match(regexp).length;

  $(".card-answer-btns").html("");

  $(".card-answer-cloze").on("keyup", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      if ($(this).val().toLowerCase() == $(this).attr("answer").toLowerCase()) {
        $(this).css("border-bottom", "#2ECC40");

        if ($(this).attr("answered") == "false") {
          answered++;
          $(this).attr("answered", "true");
          $(this).prop("disabled", true);
        }

        e.preventDefault();

        if (answered == clozes) {
          setTimeout(nextCard, 500);
        }
      } else {
        // change this to class
        $(this).css("border-bottom-color", "#FF4136");
      }
    }
  });

  $(".card-answer-cloze").on("input", function (e) {
    if ($(this).val().toLowerCase() == $(this).attr("answer").toLowerCase()) {
      $(this).css("border-bottom-color", "#2ECC40");
      
      if ($(this).attr("answered") == "false") {
        answered++;
        $(this).attr("answered", "true");
        $(this).prop("disabled", true);
      }

      e.preventDefault();

      console.log(answered + ":" + clozes);

      if (answered == clozes) {
        setTimeout(nextCard, 500);
      }
    }
  });
};

// perparations for multiple choice cards
var prepareChoice = function() {
  let builder = "";

  cards[cardIndex]["choices"].forEach(function(item) {
    builder +=
      '<a href="#" class="answer-btn-choice">' + item + "</a>";
  });

  $(".card-answer-btns").html(builder);

  $(".answer-btn-choice").on("click", function(e) {
    if ($(this).html().toLowerCase() == cards[cardIndex]["answer"].toLowerCase()) {
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

// preparations for true/false cards
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

// perparations for the input cards
var prepareEnter = function() {
  $(".card-answer-btns").html(
    '<input type="text" id="card-answer" name="card-answer">'
  );

  $("#card-answer")
    .on("keyup", function (e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        if ($(this).val().toLowerCase() == cards[cardIndex]["answer"].toLowerCase()) {
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
    $("#card-answer").on("input", function (e) {
      if (
        $(this).val().toLowerCase() == cards[cardIndex]["answer"].toLowerCase()
      ) {
        // change this to class
        $(this).css("border-bottom-color", "#2ECC40");
        e.preventDefault();
        setTimeout(nextCard, 500);
      } else {
        // change this to class
        $(this).css("border-bottom-color", "#FF4136");
      }
    });
};

// deck selection
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

// displaying the card
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
  } else if (cards[cardIndex]["type"] == "cloze") {
    $(".card-question").html(cards[cardIndex]["question"]);
    $(".card-answer").html("");
    $(".card-initial").show();
    $(".card").show();
    $("#check").hide();
    $(".card-revealed").show();
    prepareCloze();
  }
};

var init = function() {
  $("#tags").tagsInput();
  loadDecks();
};

// check button functionality for flip cards
$("#check").on("click", function() {
    $(".card-revealed").show();
});

// back button functionality 
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

// answer button functionality
$(".answer-btn").on("click", function() {
  nextCard();
});

$(".new-deck").on("click", function() {
  $(".decks").hide();
  $(".decks-header").hide();
  $("#heatmap").hide();
  $(".deck-creation").show();
});

/* algo functions */

// calculates days between for SM2 function
var daysBetween = function(first, second) {
  var getDate = function (d) {
    var splits = str.split("/");
    return new Date(splits[2], splits[0] - 1, splits[1]);
  };

  return Math.round((getDate(second) - getDate(first))/(1000*60*60*24));
};

// formats date for SM2 function
var formatDate = function(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [month, day, year].join("-");
};

// the SM2 spaced repetition algorithm
// todo: actually change the values
var repetitionAlgorithm = function(cardData) {
  // how difficult the card is [0.0, 1.0
  // default -> 0.3 for now
  var difficulty = cardData["difficulty"];

  // the current performance rating of the card
  // if not attempted -> -1
  let performanceRating = cardData["performanceRating"];

  // how many days should go by between reviews of this card
  let daysBetweenReviews = cardData["daysBetweenReviews"];

  // the last date the card was reviewed
  let dateLastReviewed = cardData["dateLastReviewed"]

  // how many days have gone by since the last review
  var daysSinceLast = daysBetween(dateLastReviewed, formatDate(new Date()));

  // need to choose the top 10-20 cards, ordered by descending percentageOverdue
  // todo: discard items reviewed in the past 8 hours
  var percentOverdue;

  // item attempted -> get performanceRating
  // performanceRating is [0.0, 1.0], 1.0 = best
  // cutoff for a correct answer is 0.6
  if (performanceRating <= 0.6) {
    percentOverdue = Math.min(2, daysSinceLast/daysBetweenReviews);
  } else {
    percentOverdue = 1;
  }

  difficulty += percentOverdue * (1/17) * (8 - 9 * performanceRating)
  let difficultyWeight = 3 - 1.7 * difficulty;

  if (performanceRating <= 0.6) {
    daysBetweenReviews *= 1 + (difficultyWeight - 1) * percentOverdue;
  } else {
    daysBetweenReviews *= Math.max(1, 1/(Math.pow(difficultyWeight, 2)));
  }

  return cardData;
};

var importAnki = function() {
  var cardsArray = [];

  var lineReader = readline.createInterface({
    input: fs.createReadStream("../extra/anki_export.txt"),
  });

  lineReader.on("line", function (line) {
    let q = line.split('\t')[0];
    let a = line.split('\t')[1];

    cardsArray.push({
      question: q,
      answer: a,
      type: "flip",
      repeat: 0,
      difficulty: 0.3,
      performanceRating: -1,
      daysBetweenReviews: 1,
      dateLastReviewed: "",
      tags: []
    });
  });

  var cardJSON = {
    "name": "Macroecon",
    "emoji": "📘",
    "cards": cardsArray,
  };

  console.log(cardJSON);
};

init();
importAnki();