
import Immutable from "immutable";
import React from "react";
import ReactDOM from "react-dom";
import DeckCode from "deckcode.js";

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
  id : 0,
  cost : 0,
  name : "",
  text : "",
  attack : 0,
  health : 0,
  durability : 0,
  count : 0,
  type : "",
  rarity : "",
  cardClass : "",
  classes : new Immutable.Set(),
  cardSet : "",
  dbfId : 0,
  collectible : true,
});
const cardDefaults = new Card(); // maybe there are some better way to do this?

function makeCard(card) {
  let c = Object.assign({}, card, {cardSet : card.set});
  c.id = c.dbfId; // only use the exchange string ID
  if (c.type.toLowerCase() === "weapon") c.health = c.durability;
  let cls = [card.cardClass];
  if (card.classes) {
    cls = card.classes;
  }
  c.classes = new Immutable.Set(cls);
  return new Card(c);
}

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

class Popup extends React.Component {
  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
    this.close = this.close.bind(this);
  }

  renderContent() {
  }

  close() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    return (
      <div className="popup" onClick={this.close}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

class ImportPopup extends Popup {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    }
    this.submit = this.submit.bind(this);
  }

  submit(deck) {
    this.setState({value:""});
    this.props.onSubmit(deck);
    this.close();
  }

  renderContent() {
    return (
      <div>
        <input type="text" value={this.state.value} onChange={e => this.setState({value : e.target.value})} />
        <button onClick={_ => this.submit(this.state.value)}>Import</button>
        <button onClick={_ => this.submit(null)}>Cancel</button>
      </div>
    );
  }
}

class ExportPopup extends Popup {
  constructor(props) {
    super(props);

    this.select = this.select.bind(this);
    this.copy = this.copy.bind(this);
  }

  select() {
    this.textOutput.select();
  }

  copy() {
    this.select();
    document.execCommand("copy");
  }

  renderContent() {
    return (
      <div>
        <input type="text" value={this.props.value} ref={c => {this.textOutput = c}} readOnly />
        <button onClick={this.copy}>Copy</button>
        <button onClick={_ => this.close()}>Close</button>
      </div>
    );
  }
}

class DeckPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      importOpen : false,
      exportOpen : false,
    }
    this.handleCardClick = this.handleCardClick.bind(this);
    this.importDeck = this.importDeck.bind(this);
    this.exportString = this.exportString.bind(this);
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

  importDeck(deck) {
    this.setState({importOpen:false});
    if (deck) {
      this.props.onImport(deck);
    }
  }

  exportString() {
    const deck = {
      isStandard : true, // for now...
      heroes : this.props.hero ? [this.props.hero.id] : [],
      cards : this.props.deck.map(c => [c.id, c.count])
    }

    return DeckCode.encode(deck);
  }


  render() {
/*        <button onClick={_ => this.setState({importOpen:true})}>Import</button>
        <button onClick={_ => this.setState({exportOpen:true})}>Export</button>
        <ImportPopup show={this.state.importOpen} onSubmit={this.importDeck} />
        <ExportPopup show={this.state.exportOpen} value={this.exportString()} onAccept={_ => this.setState({exportOpen:false})} />*/
    return (
      <div className="deckpane">
        <button onClick={_ => this.props.onPopup(<ImportPopup show={true} onSubmit={this.importDeck} />)}>Import</button>
        <button onClick={_ => this.props.onPopup(<ExportPopup show={true} value={this.exportString()} />)}>Export</button>
        <DeckList deck={this.props.deck} onClick={this.handleCardClick} />
      </div>
    );
  }
}

function MultiSelection(props) {
  function selectors() {
    const style = {
      color : props.list.count() > 0 ? "black" : "lightgray"
      };
    return props.selections.map(
      (s) => (<label style={style} key={s.key}>
          <input type="checkbox"
                 checked={props.list.has(s.key)}
                 onChange={e => props.cbOnClick({item: s, checked: e.target.checked})} />
          {s.displayName}
        </label>)
    );
  }
  return (
    <div id={props.title + "_selection"} className="">
      <a onClick={() => props.titleOnClick(props.title)} style={{color:props.titleActive?"black":"darkgray"}}>{props.title}</a>
      {selectors()}
    </div>
  );
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expand : false,
    }

    this.onChangeText = this.onChangeText.bind(this);
    this.onChangeSet = this.onChangeSet.bind(this);
    this.OnChangeList = this.onChangeList.bind(this);
  }
  onChangeText(ev) {
    const target = ev.target;
    const value = target.value;
    const name = target.name;

    this.props.onChange(this.props.terms.update(name, _ => value));
  }
  onChangeSet(e) {
    let terms = this.props.terms;
    if (e.checked) {
      if (!e.item.standard) {
        terms = terms.update("standard", _ => false);
      }
      terms = terms.update("sets", s => s.add(e.item.key));
    } else {
      terms = terms.update("sets", s => s.delete(e.item.key));
    }
    this.props.onChange(terms);
  }
  onChangeList(l, e) {
    let terms = this.props.terms;
    if (e.checked) {
      terms = terms.update(l, s => s.add(e.item.key));
    } else {
      terms = terms.update(l, s => s.delete(e.item.key));
    }
    this.props.onChange(terms);
  }
  render() {
    return (
    <div className="searchbar">
    Search here...
      <div>
    <input name="terms" type="text" onChange={this.onChangeText} />
      </div>
      <MultiSelection list={this.props.terms.sets}
          title="Wild" titleActive={!this.props.terms.standard && this.props.terms.sets.count() === 0}
          titleOnClick={() => this.props.onChange(this.props.terms.update("standard", _ => false).update("sets", _ => _.clear()))}
          selections={sets.filter(x => !x.standard)} cbOnClick={this.onChangeSet} />
      <MultiSelection list={this.props.terms.sets}
          title="Standard" titleActive={this.props.terms.standard && this.props.terms.sets.count() === 0}
          titleOnClick={() => this.props.onChange(this.props.terms.update("standard", _ => true).update("sets", _ => _.clear()))}
          selections={sets.filter(x => x.standard)} cbOnClick={this.onChangeSet} />
      <MultiSelection list={this.props.terms.rarities}
          title="Rarity" titleActive={true}
          titleOnClick={() => null}
          selections={[{key:"FREE",displayName:"Basic"},{key:"COMMON",displayName:"Common"},{key:"RARE",displayName:"Rare"},{key:"EPIC",displayName:"Epic"},{key:"LEGENDARY",displayName:"Legendary"},]} cbOnClick={x => this.onChangeList("rarities", x)} />
      <MultiSelection list={this.props.terms.types}
          title="Card Type" titleActive={true}
          titleOnClick={() => null}
          selections={[{key:"HERO",displayName:"Hero Card"},{key:"WEAPON",displayName:"Weapon"},{key:"SPELL",displayName:"Spell"},{key:"MINION",displayName:"Minion"}]} cbOnClick={x => this.onChangeList("types", x)} />
      <MultiSelection list={this.props.terms.classes}
          title="Classes" titleActive={true}
          titleOnClick={() => null}
          selections={["Neutral","Mage","Warlock","Priest","Warrior","Paladin","Druid","Shaman","Rogue","Hunter"].map(x => Object({key: x.toUpperCase(), displayName: x}))} cbOnClick={x => this.onChangeList("classes", x)} />
    </div>
    )
  }
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
  standard : true,
});

const sets = [
  { key : "CORE",       displayName : "Basic",      standard : true },
  { key : "EXPERT1",    displayName : "Expert",     standard : true },
  { key : "HOF",        displayName : "HallOfFame", standard : false },
  { key : "NAXX",       displayName : "Naxx",       standard : false },
  { key : "GVG",        displayName : "GvG",        standard : false },
  { key : "BRM",        displayName : "BRM",        standard : false },
  { key : "TGT",        displayName : "TGT",        standard : false },
  { key : "LOE",        displayName : "LoE",        standard : false },
  { key : "OG",         displayName : "OldGods",    standard : true },
  { key : "KARA",       displayName : "Karazhan",   standard : true },
  { key : "GANGS",      displayName : "MSG",        standard : true },
  { key : "UNGORO",     displayName : "Ungoro",     standard : true },
  { key : "ICECROWN",   displayName : "KFT",        standard : true },
];


const standardSets = new Immutable.Set(sets.filter(x => x.standard).map(x => x.key));



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
    if (!card.collectible) return false;
    if (card.cost < terms.minMana || card.cost > terms.maxMana) return false;
    if (card.attck < terms.minAttack || card.attack > terms.maxAttack) return false;
    if (card.health < terms.minHealth || card.health > terms.maxHealth) return false;
    if (terms.classes.count() > 0 && card.classes.intersect(terms.classes).count() === 0) return false;
    if (terms.rarities.count() > 0 && !terms.rarities.has(card.rarity)) return false;
    if (terms.sets.count() > 0 && !terms.sets.has(card.cardSet)) return false;
    if (terms.standard && !standardSets.has(card.cardSet)) return false;
    if (terms.types.count() > 0 && !terms.types.has(card.type)) return false;
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
    //card_db.filter(x => x.type !== "HERO" || !(x.set === "CORE" || x.set === "HERO SKINS")).forEach((c) => cards.set(c.id, new Card(c)));
    card_db.filter(x => x.type !== "HERO" || !(x.set === "CORE" || x.set === "HERO_SKINS")).forEach((c) => cards.set(c.dbfId, makeCard(c)));
    let heroes = new Immutable.Map();
    heroes = heroes.withMutations(m => {
      card_db.filter(x => x.type === "HERO" && (x.set === "CORE" || x.set === "HERO_SKINS")).forEach(c => m.set(c.dbfId, makeCard(c)))
    });
    this.state = { cards : new Immutable.Map(cards),
                   heroes : heroes,
                   hero : null,
                   deck : new Immutable.Map(),
                   sideboard : new Immutable.Map(),
                   popup : null
    };

    this.addToDeck = this.addToDeck.bind(this);
    this.removeFromDeck = this.removeFromDeck.bind(this);
    this.importDeck = this.importDeck.bind(this);
    this.setPopup = this.setPopup.bind(this);
    this.getPopup = this.getPopup.bind(this);
  }

  importDeck(deckString) {
    const deck = DeckCode.decode(deckString);
    const newDeck = new Immutable.Map(deck.cards);
    this.setState(function(prev,props) {
      let newCards = prev.cards.withMutations(m => {
        prev.deck.forEach((v,k) => m.setIn([k,"count"], 0));
        newDeck.forEach((v,k) => m.setIn([k,"count"], v));
      });
      return {hero: deck.heroes[0], deck: newDeck, sideboard : prev.sideboard.clear(), cards: newCards };
    });
  }

  addToDeck(cardId) {
    this.setState(function (prev,props) {
      let newDeck = null;
      const card = prev.cards.get(cardId);
      let heroId = prev.hero;
      if (heroId) {
        const hero = prev.heroes.get(prev.hero);
        if (hero.classes.union(["NEUTRAL"]).intersect(card.classes).count() === 0) {
          return {};
        }
      } else if (card.cardClass !== "NEUTRAL") {
        // find a hero, prioritize CORE heroes
        let hero = prev.heroes.find(x => x.set === "CORE" && x.cardClass === card.cardClass);
        if (!heroId) {
          hero = prev.heroes.find(x => x.cardClass === card.cardClass);
        }
        if (hero) {
          heroId = hero.id;
        }
      }
      if (!prev.deck.has(cardId)) {
        newDeck = prev.deck.set(cardId, 1);
      } else if (prev.deck.get(cardId) < (card.rarity.toLowerCase() == "legendary" ? 1 : 2)) {
        newDeck = prev.deck.update(cardId, v => v + 1);
      } else {
        return {};
      }
      return {deck : newDeck, cards : prev.cards.updateIn([cardId, "count"], v => newDeck.get(cardId)), hero: heroId};
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
        return {deck : newDeck,
                cards : prev.cards.updateIn([cardId, "count"], v => newDeck.get(cardId)),
                hero : newDeck.count() > 0 ? prev.hero : null};
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

  setPopup(popup) {
    this.setState({popup : React.cloneElement(popup, { onClose: () => this.setState({popupOpen:false,popup:null}) }) });
  }

  getPopup() {
    return this.state.popup;
  }

  render() {
    let style = {};
    if (this.state.popup) {
      style = {filter: "blur(5px) grayscale(50%)"}
    }
    return (
      <div name="main">
      <div className="deckbuilder" style={style}>
        <CardSelector cards={this.state.cards} onAddToDeck={this.addToDeck} />
        <DeckPane deck={this.getCardList(this.state.deck)}
                  sideboard={this.getCardList(this.state.sideboard)}
                  hero={this.state.heroes.get(this.state.hero)}
                  onRemove={this.removeFromDeck}
                  onImport={this.importDeck}
                  onPopup={this.setPopup}
          />
      </div>
      {this.getPopup()}
      </div>
    );
  }
}

ReactDOM.render(
  <DeckBuilder />,
  document.getElementById("deckbuilder")
);

