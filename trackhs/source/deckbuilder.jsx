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
  return <div className="searchbar">Search here...</div>;
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
  const cards = props.cards.map((c) =>
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

class CardSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchresult : card_db.filter((x) => x.type != "HERO") };

    this.search = this.search.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
  }

  search(terms) {
    console.log("search eventually");
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
        <SearchBar onChange={this.search} />
        <SearchResults cards={this.state.searchresult} onClick={this.handleCardClick} />
      </div>
      );
  }
}

class DeckBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { cards : new Map(),
                   deck : new Map(),
                   sideboard : new Map() };
    card_db.forEach((c) => this.state.cards.set(c.id, c));

    this.addToDeck = this.addToDeck.bind(this);
    this.removeFromDeck = this.removeFromDeck.bind(this);
  }

  addToDeck(cardId) {
    this.setState(function (prev,props) {
      let newDeck = new Map(prev.deck);
      if (!newDeck.has(cardId)) {
        newDeck.set(cardId, 1);
      } else if (newDeck.get(cardId) < (prev.cards.get(cardId).rarity.toLowerCase() == 'legendary' ? 1 : 2)) {
        newDeck.set(cardId, newDeck.get(cardId) + 1);
      }
      return {deck : newDeck};
    });
  }

  removeFromDeck(cardId) {
    this.setState(function (prev,props) {
      let newDeck = new Map(prev.deck);
      if (newDeck.has(cardId)) {
        let newCount = newDeck.get(cardId) - 1;
        if (newCount > 0) {
          newDeck.set(cardId, newCount);
        } else {
          newDeck.delete(cardId);
        }
      }
      return {deck : newDeck};
    });
  }

  getCardList(cardIds) {
    let ans = [];
    cardIds.forEach((c,k) => c > 0 ? ans.push(Object.assign({}, this.state.cards.get(k), {"count": c})) : null);
    console.log(cardIds, ans);
    ans.sort((a,b) => a.cost == b.cost ? a.name.localeCompare(b.name) : a.cost - b.cost);
    console.log(cardIds, ans);
    return ans;
  }
  render() {
    return (
      <div className="deckbuilder">
        <CardSelector onAddToDeck={this.addToDeck} />
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

