import { h, component } from "wigly";
import navaid from "navaid";
import Routes from "./routes";

let NotFound = component({ render: () => <div>404</div> });
let Loader = component({ render: () => <div /> });

let Router = component({
  data() {
    let curr = NotFound;
    let router = navaid("/"); // TODO 404

    // find initial route
    for (let [path, f] of Routes) {
      router.on(path, () => {
        let potentialComponent = f();

        if (potentialComponent.then) {
          curr = Loader;
          return;
        }

        curr = potentialComponent;
      });
    }

    router.listen();
    return { component: curr, router };
  },

  mounted() {
    // update on route change
    for (let [path, f] of Routes) {
      this.state.router.on(path, async () => {
        let potentialComponent = f();

        if (potentialComponent.then) {
          let mod = await potentialComponent;
          potentialComponent = mod.default;
        }

        this.setState(() => ({ component: potentialComponent }));
      });
    }

    this.state.router.listen(); // load in async routes
  },

  render() {
    return <this.state.component />;
  }
});

export default Router;
