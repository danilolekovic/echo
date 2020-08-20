const fs = require("fs");

let deck = "";
let rawdata = fs.readFileSync("./data/math.json");
let cards = JSON.parse(rawdata)["cards"];
var cardIndex = 0;

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