import Express from "express";
import Comrpession from "compression";
import Path from "path";
import Helmet from "helmet";
import wigly, { h } from "wigly";
import render from "wigly-server";
import App from "./app";
import Routes from "./routes";

let Container = wigly.component({
  render() {
    return (
      <html>
        <head>
          <title>Wigly Documentation</title>
          <link rel="stylesheet" type="text/css" href="/main.css" />
        </head>
        <body>
          {this.children}
          <script src="/main.js" />
        </body>
      </html>
    );
  }
});

let Loader = wigly.component({ render: () => <div /> });

let ssr = f => (_, res) => {
  let potentialComponent = f();
  let Component = potentialComponent;
  if (potentialComponent.then) Component = Loader;

  res.send(
    render(
      wigly.component({
        render: () => (
          <Container>
            <App>
              <Component />
            </App>
          </Container>
        )
      })
    )
  );
};

let server = new Express();

server.use(Helmet());
server.use(Comrpession());
server.use(Express.static(Path.join(__dirname, "dist")));

for (let [path, component] of Routes) {
  server.get(path, ssr(component));
}

server.listen(process.env.PORT || 8080);
