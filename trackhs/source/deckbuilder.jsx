
const deck = [
  { "id" : "A_1",
    "cost" : 3,
    "name" : "Egregious Owl",
    "attack" : 3,
    "health" : 4,
    "count" : 1,
  },
  { "id" : "A_2",
    "cost" : 10,
    "name" : "Orange Boar",
    "attack" : 6,
    "health" : 7,
    "count" : 2,
  },
];


class Card extends React.Component {
}

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
        <DeckList deck={deck} onClick={this.clickhandler} />
      </div>
    );
  }
}

class CardSelector extends React.Component {
  render() {
    return (
      <div className="cardselector">
        <div><p>search bar, wrong?</p></div>
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
  document.getElementById('deckbuilder')
);

