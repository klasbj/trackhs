
const deck = [
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

function DeckCard(props) {
  
  const click = function(e) {
    if (props.onClick) {
      props.onClick({button: e.button, card: e.card});
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
  clickhandler(e) {
    console.log(e);
  }
  render() {
    return (
      <div className="deckpane">
        <DeckList deck={deck.filter((x) => x.count > 0)} onClick={this.clickhandler} />
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
      props.onClick({button: e.button, card: e.card});
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
    this.state = { searchresult : deck };
  }

  search(terms) {
    console.log("search eventually");
  }

  render() {
    return (
      <div className="cardselector">
        <SearchBar onChange={this.search} />
        <SearchResults cards={this.state.searchresult} />
      </div>
      );
  }
}

class DeckBuilder extends React.Component {
  render() {
    return (
      <div className="deckbuilder">
        <CardSelector />
        <DeckPane />
      </div>
    );
  }
}

ReactDOM.render(
  <DeckBuilder />,
  document.getElementById("deckbuilder")
);

