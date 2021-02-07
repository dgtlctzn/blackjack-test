$(document).ready(function () {
  const playerEl = $("#player");
  const dealerEl = $("#dealer");
  const scoreEl = $("#score");
  const dealerScoreEl = $("#d-score");
  const hitButton = $("#hit");
  const holdButton = $("#hold");
  const result = $("#result");

  let playerScore = 0;
  let dealerScore = 0;
  let pAces = 0;
  let dAces = 0;
  const deltCards = [];
  let currPlayerHand = [];

  function showScores() {
    $(".hidden").removeClass("hidden");
    dealerScoreEl.empty()
    dealerScoreEl.text(dealerScore);
    if (dealerScore <= 21 && dealerScore > playerScore) {
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

  function hold(delt, tries=0) {
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
          console.log("score: " + hand.scores.byHand[0])
          console.log("init: " + dealerScore)
          dealerScore += hand.scores.byHand[0];
          console.log(dAces);
          if (dAces > 0 && dealerScore > 21) {
            if (dealerScore - 10 >= 10) {
              dealerScore -= 10;
              dAces -= 1;
            }
          }
          console.log(dealerScore);
          tries++;
          console.log("try " + tries);
          // console.log("try");
          let dealerCard = $("<li>").text(hand.asArray[0][0]);
          dealerEl.append(dealerCard);
          // showScores();
          hold(deltCards, tries);
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      showScores();
      hitButton.attr("disabled", true)
      holdButton.attr("disabled", true)
    }
  }

  function hitMe(delt) {
    const cards = {
      previous_cards: delt,
      hand_size: 1,
    };
    console.log(cards);
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
        // let aces = 0;
        if (pAces > 0 && playerScore > 21) {
          if (playerScore - 10 >= 10) {
            playerScore -= 10;
            pAces -= 1;
          }
        } else if (playerScore > 21) {
          result.text("You Lost!");
        }
        scoreEl.text(playerScore);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function startDeal() {
    $.get({
      url:
        "https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards?hand_size=2&total_hands=2",
    })
      .then(function ({ hand }) {
        console.log(hand);
        const [playerHand, dealerHand] = hand.asArray;
        const initScore = hand.scores.byHand;
        playerScore += initScore[0];
        dealerScore += initScore[1];
        pAces += hand.scores.acesByHand[0];
        if (pAces === 2) {
          playerScore -= 10;
        } else if (dAces === 2) {
          dealerScore -= 10;
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
        scoreEl.text(playerScore);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  startDeal();

  hitButton.on("click", function () {
    hitMe(deltCards);
  });

  holdButton.on("click", function () {
    hold(deltCards);
  });
});
