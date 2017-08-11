function varintDecode(bytestr) {
  let arr = [];
  let curr = 0, cnt = 0;
  for (let i = 0; i < bytestr.length; i++) {
    curr += (bytestr.charCodeAt(i) & 0x7f) << cnt*7;
    cnt++;
    if ((bytestr.charCodeAt(i) & 0x80) === 0) {
      arr.push(curr);
      curr = 0;
      cnt = 0;
    }
  }
  if (curr !== 0) {
    console.log("something is wrong with: ", b64str);
  }
  return arr;
}

function varintEncode(values) {
  let arr = [];
  for (let v of values) {
    do {
      let nv = v & 0x7f;
      v >>= 7;
      if (v > 0) {
        nv |= 0x80;
      }
      arr.push(String.fromCharCode(nv));
    } while (v > 0);
  }
  return arr.join('');
}

export default {
  decode : function(b64str) {
    const values = varintDecode(atob(b64str));
    if (values[0] !== 0 || values[1] !== 1) {
      console.log("Unrecognized deck string");
      return null;
    }
    let deck = {
      isStandard : values[2] === 2,
      heroes : null,
      cards : null,
    };
    values.splice(0, 3);
    deck.heroes = values.splice(1, values[0]);
    values.shift();
    deck.cards = values.splice(1, values[0]).map(x => [x,1]);
    values.shift();
    Array.prototype.push.apply(deck.cards, values.splice(1, values[0]).map(x => [x,2]));
    values.shift();
    Array.prototype.push.apply(deck.cards, values.splice(1, values[0]));
    values.shift();

    return deck;
  },

  encode : function(deck) {
    let values = [0, 1];
    values.push(deck.isStandard ? 2 : 1);
    values.push(deck.heroes.length);
    Array.prototype.push.apply(values, deck.heroes);
    for (let fn of [(x) => x[1] === 1, (x) => x[1] === 2, (x) => x[1] > 2]) {
      let cards = deck.cards.filter(fn).map(x => x[0]).sort((a,b) => a-b);
      values.push(cards.length);
      Array.prototype.push.apply(values, cards);
    }

    return btoa(varintEncode(values));
  }
}
