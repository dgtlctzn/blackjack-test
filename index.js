$(document).ready(function () {
  const playerEl = $("#player");
  const dealerEl = $("#dealer");
  const scoreEl = $("#score");
  const hitButton = $("#hit");
  const result = $("#result");

  let playerScore = 0;
  let dealerScore = 0;
  let pAces = 0;
  let dAces = 0;
  const deltCards = [];
  let currPlayerHand = [];

  function hitMe(delt) {
    const cards = {
      previous_cards: delt,
      hand_size: 1,
    };
    console.log(cards);
    $.post({
      url:
        "https://cors-anywhere.herokuapp.com/https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards",
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
          } 
        } else if (playerScore > 21) {
          result.text("You Lost!");
        }
      
        //   let [score, _, ace] = convertCardToNum(card);
        //   playerScore += score;
        //   if (ace) {
        //     aces++;
          // }
        // }
        // if (aces > 0 && playerScore > 21) {
        //   playerScore -= 10 * aces;
        // }
        // if (playerScore > 21) {
        //   result.text("You Lost!");
        // }
        scoreEl.text(playerScore);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  // function convertCardToNum(card) {
  //   const values = {
  //     Ace: 11,
  //     Jack: 10,
  //     Queen: 10,
  //     King: 10,
  //   };
  //   const [pip, _, hand] = card.split(" ");
  //   let num = pip;
  //   let ace = false;
  //   if (values[pip]) {
  //     num = values[pip];
  //     if (pip === "Ace") {
  //       ace = true;
  //     }
  //   }
  //   return [parseInt(num), hand, ace];
  // }

  function startDeal() {
    $.get({
      url:
        "https://8b5qreoqz7.execute-api.us-east-1.amazonaws.com/randomCards?hand_size=2&total_hands=2",
        headers: {
          // 'Content-Type': 'application/x-www-form-urlencoded'
          "Access-Control-Allow-Origin": "https://dgtlctzn.github.io"
      },

    //   xhrFields: {
    //     withCredentials: true
    // },
    })
      .then(function ({ hand }) {
        console.log(hand);
        const [playerHand, dealerHand] = hand.asArray;
        const initScore = hand.scores.byHand;
        playerScore += initScore[0];
        dealerScore += initScore[1];
        pAces += hand.scores.acesByHand[0];
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
});
