import test from "ava";
import { render } from "..";
import { h } from "wigly-jsx";
import { component, IComponent } from "wigly-component";

// @ts-ignore
require("browser-env")();

test("Typed components work as expected.", t => {
  var Child: IComponent<{ greeting: string }, { name: string }> = component({
    data() {
      return { name: "Evan" };
    },

    render() {
      return { children: `${this.props.greeting}, ${this.state.name}!` };
    }
  });

  var Parent: IComponent<{}, {}> = component({
    data() {
      return {};
    },

    render() {
      return Child({ greeting: "Hi" });
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hi, Evan!");
});

// Works, but ava + typescript + jsx don't like each other.
// test("Typed JSX.", t => {
//   var Child: IComponent<{ greeting: string }, { name: string }> = component({
//     data() {
//       return { name: "Evan" };
//     },

//     render() {
//       return (
//         <div>
//           {this.props.greeting}, {this.state.name}!
//         </div>
//       );
//     }
//   });

//   var Parent: IComponent<{}, {}> = component({
//     data() {
//       return {};
//     },

//     render() {
//       return <Child greeting="Hi" />;
//     }
//   });

//   var el = render(Parent, document.body);
//   t.deepEqual(el.textContent, "Hi, Evan!");
// });
