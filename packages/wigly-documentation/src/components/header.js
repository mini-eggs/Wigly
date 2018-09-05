import { h, component } from "wigly";
import Navigation from "../containers/navigation";

let renderLink = (item, i) => (
  <li key={i}>
    <a href={item.href}>{item.title}</a>
  </li>
);

let Header = component({
  render() {
    return (
      <header>
        <a href="/">
          <h2>Wigly</h2>
        </a>
        <nav>
          <ul>{this.props.links.map(renderLink)}</ul>
        </nav>
        <div>
          <input type="text" placeholder="search" />
        </div>
      </header>
    );
  }
});

export default Navigation(Header);
