// @jsx h
let { h, render, useState, useEffect } = require("../dist/es6");
let navaid = require("navaid").default;

let Loader = () => <div>Loading...</div>;
let Home = () => <div>home</div>;
let Fuck = () => <div>fuck</div>;

let Nav = () => (
  <ul>
    <a href="/">Home</a>
    <a href="/fuck">Fuck</a>
  </ul>
);

let useRouter = routes => {
  let [router] = useState(navaid("/"));
  let [params, setParams] = useState({});
  let [route, setRoute] = useState(Loader);

  useEffect(() => {
    for (let [href, component] of routes) {
      router.on(href, params => {
        setParams(params);
        setRoute(component);
      });
    }
    router.listen();
    return () => router.unlisten();
  }, 0);

  return [route, params];
};

let App = () => {
  let [Route, params] = useRouter([["/", Home], ["/fuck", Fuck]]);
  return (
    <main>
      <Nav />
      <Route {...params} />
    </main>
  );
};

render(<App />, document.body);
