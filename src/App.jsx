import React from "react";

import "./App.css";

function App() {
  const state = React.useRef(
    store({
      text: "vilius",
      number: 1,
    })
  );

  React.useEffect(() => {
    setInterval(() => {
      state.current.number += 1;
      console.log(state.current.number);
    }, 1000);
  });

  return (
    <div className="App">
      <Component1 store={state.current} />
      <Component2 store={state.current} />
    </div>
  );
}

const Component1 = view(
  class Component1 extends React.Component {
    render() {
      return <p>{this.props.store.text}</p>;
    }
  }
);

const Component2 = view(
  class Component2 extends React.Component {
    render() {
      return <p>{this.props.store.number}</p>;
    }
  }
);

export default App;

const reactionsMap = {};
let currentlyRenderingComponent;

const handler = {
  get: (target, prop) => {
    if (currentlyRenderingComponent === undefined) {
      return target[prop];
    }

    if (!reactionsMap[prop]) {
      reactionsMap[prop] = [currentlyRenderingComponent];
    }

    const hasComponent = reactionsMap[prop].find(
      (it) => it.id === currentlyRenderingComponent.id
    );
    if (!hasComponent) {
      reactionsMap[prop].push(currentlyRenderingComponent);
    }

    return target[prop];
  },
  set: (target, prop, value) => {
    if (reactionsMap[prop]) {
      reactionsMap[prop].forEach((it) => it.forceUpdate());
    }

    target[prop] = value;
    return true;
  },
};

function store(object) {
  return new Proxy(object, handler);
}

function view(MyComponent) {
  return class Observer extends MyComponent {
    id;

    constructor() {
      super();
      this.id = `${Math.floor(Math.random() * 10e9)}`;
    }

    render() {
      currentlyRenderingComponent = this;
      const renderValue = super.render();
      currentlyRenderingComponent = undefined;
      return renderValue;
    }
  };
}
