$(document).ready(function () {
  const playerEl = $("#player");
  const dealerEl = $("#dealer");
  const scoreEl = $("#score");
  const dealerScoreEl = $("#d-score");
  const hitButton = $("#hit");
  const holdButton = $("#hold");
  const result = $("#result");
  const playAgainButton = $("#play-again");
  const suits = $(".suits");
  const altSuits = $(".alt-suits");

  let playerScore = 0;
  let dealerScore = 0;
  let pAces = 0;
  let dAces = 0;
  let deltCards = [];
  let currPlayerHand = [];

  (function animate() {
    suits.attr("style", "color: red;");
    altSuits.attr("style", "color: black;");
    setTimeout(function () {
      suits.attr("style", "color: black;");
      altSuits.attr("style", "color: red;");
      setTimeout(animate, 600);
    }, 600);
  })();

  function startDeal() {
    $.get({
      url:
        "https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards?hand_size=2&total_hands=2",
    })
      .then(function ({ hand }) {
        const [playerHand, dealerHand] = hand.asArray;
        const initScore = hand.scores.byHand;
        let displayScore = initScore[0];
        playerScore += initScore[0];
        dealerScore += initScore[1];
        pAces += hand.scores.acesByHand[0];
        if (pAces === 2) {
          displayScore -= 10;
        }
        dAces += hand.scores.acesByHand[0];
        for (let i = 0; i < 2; i++) {
          let playerCard = $("<li>").text(playerHand[i]);
          let dealerCard = $("<li>").text(dealerHand[i]);
          playerEl.append(playerCard);
          dealerEl.append(dealerCard);
          if (i === 1) {
            dealerCard.addClass("hidden");
          }
          deltCards.push(playerHand[i]);
          deltCards.push(dealerHand[i]);
          currPlayerHand.push(playerHand[i]);
        }
        scoreEl.text(displayScore);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function hitMe(delt) {
    const cards = {
      previous_cards: delt,
      hand_size: 1,
    };
    $.post({
      url: "https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards",
      data: JSON.stringify(cards),
    })
      .then(function ({ hand }) {
        const playerC = hand.asArray[0][0];
        playerScore += hand.scores.byHand[0];
        pAces += hand.scores.acesByHand[0];
        dAces += hand.scores.acesByHand[1];
        let playerCard = $("<li>").text(playerC);
        playerEl.append(playerCard);
        deltCards.push(playerC);
        currPlayerHand.push(playerC);
        if (pAces > 0) {
          while (playerScore > 21 && pAces > 0) {
              playerScore -= 10;
              pAces--;
          }
        }
        if (playerScore > 21) {
          hold(deltCards);
        }
        scoreEl.text(playerScore);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function hold(delt, tries = 0) {
    if (dealerScore < 17 && tries < 6) {
      const cards = {
        previous_cards: delt,
        hand_size: 1,
      };
      $.post({
        url:
          "https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards",
        data: JSON.stringify(cards),
      })
        .then(function ({ hand }) {
          dAces += hand.scores.acesByHand[0];
          dealerScore += hand.scores.byHand[0];
          if (dAces > 0) {
            while (dealerScore > 21 && dAces > 0) {
                dealerScore -= 10;
                dAces--;
            }
          }
          tries++;
          let dealerCard = $("<li>").text(hand.asArray[0][0]);
          dealerEl.append(dealerCard);
          hold(deltCards, tries);
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      showScores();
      hitButton.attr("disabled", true);
      holdButton.attr("disabled", true);
    }
  }

  function showScores() {
    $(".hidden").removeClass("hidden");
    dealerScoreEl.empty();
    dealerScoreEl.text(dealerScore);
    if (playerScore > 21 || (dealerScore <= 21 && dealerScore > playerScore)) {
      result.text("You Lost!");
    } else if (
      (playerScore <= 21 && playerScore > dealerScore) ||
      (playerScore <= 21 && dealerScore > 21)
    ) {
      result.text("You Won!");
    } else {
      result.text("Tie!");
    }
  }

  function playAgain() {
    hitButton.attr("disabled", false);
    holdButton.attr("disabled", false);
    playAgainButton.addClass("hidden");
    playerEl.empty();
    dealerEl.empty();
    result.empty();
    dealerScoreEl.empty();
    playerScore = 0;
    dealerScore = 0;
    pAces = 0;
    dAces = 0;
    deltCards = [];
    currPlayerHand = [];
  }

  hitButton.on("click", function () {
    hitMe(deltCards);
  });

  holdButton.on("click", function () {
    hold(deltCards);
  });

  playAgainButton.on("click", function () {
    playAgain();
    startDeal();
  });

  startDeal();
});
