import { h, component } from "wigly";
import Header from "./components/header";

let App = component({
  render() {
    return (
      <main>
        <Header />
        {this.children}
      </main>
    );
  }
});

export default App;
