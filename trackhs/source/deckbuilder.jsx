
import Immutable from "immutable";
import React from "react";
import ReactDOM from "react-dom";

/*
const card_db = [
  { "id" : "A_1",
    "cost" : 3,
    "name" : "Egregious Owl",
    "text" : "<b>Charge</b> <b>Flying</b>",
    "attack" : 3,
    "health" : 4,
    "count" : 1,
    "type" : "MINION",
    "rarity" : "COMMON",
    "cardClass" : "HUNTER",
  },
  { "id" : "A_2",
    "cost" : 10,
    "name" : "Orange Boar",
    "text" : "Is Orange while not Green.",
    "attack" : 6,
    "health" : 7,
    "count" : 2,
    "type" : "MINION",
    "rarity" : "FREE",
    "cardClass" : "NEUTRAL",
  },
  {"artist":"Justin Sweet","attack":4,"cardClass":"NEUTRAL","collectible":true,"cost":5,"dbfId":61,"faction":"HORDE","flavor":"She'll craft you a sword, but you'll need to bring her 5 Steel Ingots, 3 Motes of Earth, and the scalp of her last customer.","health":6,"id":"CS2_221","mechanics":["ENRAGED"],"name":"Spiteful Smith","playerClass":"NEUTRAL","rarity":"COMMON","set":"EXPERT1","text":"<b>Enrage:</b> Your weapon has +2 Attack.","type":"MINION"},
  {"artist":"Steve Hui","cardClass":"ROGUE","collectible":true,"cost":1,"dbfId":990,"flavor":"Rogues conceal everything but their emotions.  You can't get 'em to shut up about feelings.","id":"EX1_128","name":"Conceal","playerClass":"ROGUE","rarity":"COMMON","referencedTags":["STEALTH"],"set":"HOF","text":"Give your minions <b>Stealth</b> until your next turn.","type":"SPELL"},
  {"artist":"Alex Horley Orlandelli","attack":3,"cardClass":"WARLOCK","collectible":true,"cost":9,"dbfId":777,"elite":true,"flavor":"\"TRIFLING GNOME! YOUR ARROGANCE WILL BE YOUR UNDOING!!!!\"","health":15,"id":"EX1_323","mechanics":["BATTLECRY"],"name":"Lord Jaraxxus","playerClass":"WARLOCK","race":"DEMON","rarity":"LEGENDARY","set":"EXPERT1","text":"<b>Battlecry:</b> Destroy your hero and replace it with Lord Jaraxxus.","type":"MINION"}
];
*/

const Card = Immutable.Record({
  id : "",
  cost : 0,
  name : "",
  text : "",
  attack : 0,
  health : 0,
  count : 0,
  type : "",
  rarity : "",
  cardClass : "",
  classes : new Immutable.Set(),
  cardSet : "",
  dbfIf : 0,
});
const cardDefaults = new Card(); // maybe there are some better way to do this?

function DeckCard(props) {
  
  const click = function(e) {
    if (props.onClick) {
      props.onClick({button: e.button, card: props.card.id});
    }
  }

  return (
    <li className="deckcard" onMouseDown={click} onContextMenu={(e) => e.preventDefault()}>
      <div className="primary">
        <div className="cost">{props.card.cost}</div>
        <div className="name">{props.card.name}</div>
        {props.card.count > 1 ? <div className="cnt">{props.card.count}</div> : null}
      </div>
      <div className="extra">
        extra information
      </div>
    </li>
  );
}

function DeckList(props) {
  const cards = props.deck.map((c) =>
    <DeckCard key={c.id} card={c} onClick={props.onClick} />
  );
  return (
    <div className="decklist">
      <ul>
        {cards}
      </ul>
    </div>
  );
}

class DeckPane extends React.Component {
  constructor(props) {
    super(props);

    this.handleCardClick = this.handleCardClick.bind(this);
  }

  handleCardClick(ev) {
    switch (ev.button) {
      case 0:
        this.props.onRemove(ev.card);
        break;
      default:
        break;
    }
  }
  render() {
    return (
      <div className="deckpane">
        <DeckList deck={this.props.deck} onClick={this.handleCardClick} />
      </div>
    );
  }
}

function SearchBar(props) {
  function onChangeText(ev) {
    const target = ev.target;
    const value = target.value;
    const name = target.name;

    props.onChange(props.terms.update(name, _ => value));
  }
  return (
    <div className="searchbar">
    Search here...
    <input name="terms" type="text" onChange={onChangeText} />
    </div>
  );
}

function MinionStatline(props) {
  return (
    <div className="statline right">
        {props.card.attack} / {props.card.health}
    </div>
  );
}

function WeaponStatline(props) {
  return (
    <div className="statline right">
        {props.card.attack} / {props.card.health}
    </div>
  );
}

function SearchCard(props) {
  
  const click = function(e) {
    if (props.onClick) {
      props.onClick({button: e.button, card: props.card.id});
    }
  }

  let statline = null;
  if (props.card.type === "MINION") {
    statline = <MinionStatline card={props.card} />;
  } else if (props.card.type === "WEAPON") {
    statline = <WeaponStatline card={props.card} />;
  }

  let itemclasses = "card";
  itemclasses += " " + props.card.cardClass.toLowerCase();
  if (props.card.count !== undefined) {
    if (props.card.count > 1 ||
        (props.card.rarity.toLowerCase() === "legendary" && props.card.count > 0)) {
      itemclasses += " full";
    }
  }

  return (
    <li className={itemclasses} onMouseDown={click} onContextMenu={(e) => e.preventDefault()}>
      <div className="cost left">{props.card.cost}</div>
      <div className="name">{props.card.name}</div>
      <div className="type right">{props.card.type[0].toUpperCase()}</div>
      <div className="text"><span dangerouslySetInnerHTML={{__html: props.card.text}} /></div>
      <div className={"rarity left " + props.card.rarity.toLowerCase()}>{props.card.rarity[0].toUpperCase()}</div>
      <div className="race">{props.card.race}</div>
      {statline}
    </li>
  );
}

function SearchResults(props) {
  const cards = props.cards.sort((a,b) => a.cost == b.cost ? a.name.localeCompare(b.name) : a.cost - b.cost).toList().map((c) =>
    <SearchCard key={c.id} card={c} onClick={props.onClick} />
  );
  return (
    <div className="searchresults">
      <ul>
        {cards}
      </ul>
    </div>
  );
}

const SearchTerms = Immutable.Record({
  minMana : 0,
  maxMana : 25,
  classes : new Immutable.Set(), // some enum for all?
  rarities : new Immutable.Set(),
  sets : new Immutable.Set(),
  minAttack : 0,
  maxAttack : 100,
  minHealth : 0,
  maxHealth : 100,
  types : new Immutable.Set(),
  terms : "",
});



class CardSelector extends React.Component {
  constructor(props) {
    super(props);
    //this.state = { searchresult : card_db.filter((x) => x.type != "HERO") };

    this.state = {
      terms : new SearchTerms(),
    };
    this.search = this.search.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.cardMatches = this.cardMatches.bind(this);
  }

  cardMatches(card, terms) {
    if (card.cost < terms.minMana || card.cost > terms.maxMana) return false;
    if (card.attck < terms.minAttack || card.attack > terms.maxAttack) return false;
    if (card.health < terms.minHealth || card.health > terms.maxHealth) return false;
    if (terms.classes.size > 0 && card.classes.union(terms.classes).size === 0) return false;
    if (terms.rarity > 0 && !terms.rarities.has(card.rarity)) return false;
    if (terms.sets > 0 && !terms.sets.has(card.set)) return false;
    if (terms.types.size > 0 && !terms.types.has(card.type)) return false;
    if (terms.terms.length > 0) {
      let re = new RegExp(terms.terms, 'ig');
      if (!(re.test(card.name) || re.test(card.text))) return false;
    }

    return true;
  }

  search(terms) {
    this.setState({terms: terms});
  }

  handleCardClick(ev) {
    switch (ev.button) {
      case 0:
        this.props.onAddToDeck(ev.card);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="cardselector">
        <SearchBar terms={this.state.terms} onChange={this.search} />
        <SearchResults cards={this.props.cards.toSeq().filter((x) => this.cardMatches(x, this.state.terms))} onClick={this.handleCardClick} />
      </div>
      );
  }
}

class DeckBuilder extends React.Component {
  constructor(props) {
    super(props);
    let cards = new Map();
    card_db.filter(x => x.type !== "HERO").forEach((c) => cards.set(c.id, new Card(c)));
    this.state = { cards : new Immutable.Map(cards),
                   deck : new Immutable.Map(),
                   sideboard : new Immutable.Map() };

    this.addToDeck = this.addToDeck.bind(this);
    this.removeFromDeck = this.removeFromDeck.bind(this);
  }

  addToDeck(cardId) {
    this.setState(function (prev,props) {
      let newDeck = null; //ew Map(prev.deck);
      if (!prev.deck.has(cardId)) {
        newDeck = prev.deck.set(cardId, 1);
      } else if (prev.deck.get(cardId) < (prev.cards.get(cardId).rarity.toLowerCase() == "legendary" ? 1 : 2)) {
        newDeck = prev.deck.update(cardId, v => v + 1);
      } else {
        return {};
      }
      return {deck : newDeck, cards : prev.cards.updateIn([cardId, "count"], v => newDeck.get(cardId))};
    });
  }

  removeFromDeck(cardId) {
    this.setState(function (prev,props) {
      let newDeck = null;//new Map(prev.deck);
      if (prev.deck.has(cardId)) {
        let newCount = prev.deck.get(cardId) - 1;
        if (newCount > 0) {
          newDeck = prev.deck.set(cardId, newCount);
        } else {
          newDeck = prev.deck.delete(cardId);
        }
        return {deck : newDeck, cards : prev.cards.updateIn([cardId, "count"], v => newDeck.get(cardId))};
      }
      return {};
    });
  }

  getCardList(cardIds) {
    let ans = [];
    cardIds.forEach((c,k) => c > 0 ? ans.push(this.state.cards.get(k)
      //Object.assign({}, this.state.cards.get(k).toObject(), {"count": c})
    ) : null);
    ans.sort((a,b) => a.cost == b.cost ? a.name.localeCompare(b.name) : a.cost - b.cost);
    return ans;
  }
  render() {
    return (
      <div className="deckbuilder">
        <CardSelector cards={this.state.cards} onAddToDeck={this.addToDeck} />
        <DeckPane deck={this.getCardList(this.state.deck)}
                  sideboard={this.getCardList(this.state.sideboard)}
                  onRemove={this.removeFromDeck}
          />
      </div>
    );
  }
}

ReactDOM.render(
  <DeckBuilder />,
  document.getElementById("deckbuilder")
);

