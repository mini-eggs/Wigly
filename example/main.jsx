// @jsx wigly.h
import wigly, { useState, useEffect } from "../";
import navaid from "navaid";
import "babel-polyfill";

let def = () => <div />;

function Home() {
  return <div>home</div>;
}

function Blog() {
  return <div>blog</div>;
}

function useRouter(router, routes) {
  let [[comp, params], set] = useState([def, {}]);

  useEffect(() => {
    for (let route of routes) {
      router.on(route.href, params => {
        set([route.component, params]);
      });
    }
  }, 0);

  useEffect(router.listen, 0);

  return [comp, params];
}

function Nav() {
  return (
    <nav>
      <a href="/">home</a>
      <a href="/blog">blog</a>
    </nav>
  );
}

let AsyncNav = () => Promise.resolve({ default: Nav });

let AsyncHome = () =>
  new Promise(resolve => {
    setTimeout(resolve, 250, { default: Home });
  });

let AsyncBlog = () =>
  new Promise(resolve => {
    setTimeout(resolve, 250, { default: Blog });
  });

function App(props) {
  var [Comp, props] = useRouter(new navaid("/"), [
    { href: "/", component: AsyncHome },
    { href: "/err", component: AsyncHome },
    { href: "/blog", component: AsyncBlog }
  ]);

  return (
    <div>
      <AsyncNav />
      <Comp {...props} />
    </div>
  );
}

wigly.render(<App />, document.body);
