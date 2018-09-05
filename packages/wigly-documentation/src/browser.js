import { h, component, hydrate } from "wigly";
import App from "./app";
import Router from "./router";
import "./styles/main.css";

let AppWithRouter = component({
  render() {
    return (
      <App>
        <Router />
      </App>
    );
  }
});

hydrate(AppWithRouter, document.body);
