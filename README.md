# Wigly

A silly-small, component-based UI library. Built to be lean.

<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBB%0D%0AZG9iZSBJbGx1c3RyYXRvciAyMi4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9u%0D%0AOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1s%0D%0AbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53%0D%0AMy5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAyMDAgMjAw%0D%0AIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAyMDAgMjAwOyIgeG1sOnNwYWNlPSJw%0D%0AcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDpub25lO3N0cm9r%0D%0AZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5l%0D%0Aam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQoJLnN0MXtmaWxsOiNGNURFMTk7fQ0K%0D%0ACS5zdDJ7Y2xpcC1wYXRoOnVybCgjU1ZHSURfMl8pO30NCjwvc3R5bGU+DQo8c3ltYm9sICBpZD0i%0D%0ATmV3X1N5bWJvbCIgdmlld0JveD0iLTYgLTI0LjUgMTIgNDkiPg0KCTxnPg0KCQk8cGF0aCBjbGFz%0D%0Acz0ic3QwIiBkPSJNNCwyMi41YzAtNC41LTgtNC41LTgtOUMtNCw5LDQsOSw0LDQuNUM0LDAtNCww%0D%0ALTQtNC41YzAtNC41LDgtNC41LDgtOWMwLTQuNS04LTQuNS04LTkiLz4NCgk8L2c+DQo8L3N5bWJv%0D%0AbD4NCjxnPg0KCTxnPg0KCQk8cmVjdCB4PSIxNCIgeT0iMTQiIGNsYXNzPSJzdDEiIHdpZHRoPSIx%0D%0ANzIiIGhlaWdodD0iMTcyIi8+DQoJCTxwYXRoIGQ9Ik0xODgsMTg4SDEyVjEyaDE3NlYxODh6IE0x%0D%0ANiwxODRoMTY4VjE2SDE2VjE4NHoiLz4NCgk8L2c+DQoJPGc+DQoJCTxkZWZzPg0KCQkJPHJlY3Qg%0D%0AaWQ9IlNWR0lEXzFfIiB4PSIxNCIgeT0iMTQiIHdpZHRoPSIxNzIiIGhlaWdodD0iMTcyIi8+DQoJ%0D%0ACTwvZGVmcz4NCgkJPGNsaXBQYXRoIGlkPSJTVkdJRF8yXyI+DQoJCQk8dXNlIHhsaW5rOmhyZWY9%0D%0AIiNTVkdJRF8xXyIgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQk8L2NsaXBQYXRoPg0K%0D%0ACQk8ZyBjbGFzcz0ic3QyIj4NCgkJCQ0KCQkJCTx1c2UgeGxpbms6aHJlZj0iI05ld19TeW1ib2wi%0D%0AICB3aWR0aD0iMTIiIGhlaWdodD0iNDkiIHg9Ii02IiB5PSItMjQuNSIgdHJhbnNmb3JtPSJtYXRy%0D%0AaXgoMC4zNzYgLTAuOTI2NiAtMC45MjY2IC0wLjM3NiAxNjIuNDMzNiAxMjYuMDk3NikiIHN0eWxl%0D%0APSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQkJDQoJCQkJPHVzZSB4bGluazpocmVmPSIjTmV3X1N5%0D%0AbWJvbCIgIHdpZHRoPSIxMiIgaGVpZ2h0PSI0OSIgeD0iLTYiIHk9Ii0yNC41IiB0cmFuc2Zvcm09%0D%0AIm1hdHJpeCgwLjQwNDEgLTEuMjE2OCAtMS4yMTY4IC0wLjQwNDEgMTQuMjY1MyAzMS41MTIyKSIg%0D%0Ac3R5bGU9Im92ZXJmbG93OnZpc2libGU7Ii8+DQoJCQkNCgkJCQk8dXNlIHhsaW5rOmhyZWY9IiNO%0D%0AZXdfU3ltYm9sIiAgd2lkdGg9IjEyIiBoZWlnaHQ9IjQ5IiB4PSItNiIgeT0iLTI0LjUiIHRyYW5z%0D%0AZm9ybT0ibWF0cml4KDAuNTExIDAuNjAzMiAwLjYwMzIgLTAuNTExIDE1Ny40ODMgMjEuMDIwMSki%0D%0AIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQkJDQoJCQkJPHVzZSB4bGluazpocmVmPSIj%0D%0ATmV3X1N5bWJvbCIgIHdpZHRoPSIxMiIgaGVpZ2h0PSI0OSIgeD0iLTYiIHk9Ii0yNC41IiB0cmFu%0D%0Ac2Zvcm09Im1hdHJpeCgtMS4zNjMgLTAuNjA2NCAtMC42MDY0IDEuMzYzIDY1LjM3NjMgNTMuMjY4%0D%0ANSkiIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQkJDQoJCQkJPHVzZSB4bGluazpocmVm%0D%0APSIjTmV3X1N5bWJvbCIgIHdpZHRoPSIxMiIgaGVpZ2h0PSI0OSIgeD0iLTYiIHk9Ii0yNC41IiB0%0D%0AcmFuc2Zvcm09Im1hdHJpeCgwLjU1MTUgMC41NzM3IDAuNTczNyAtMC41NTE1IDY3LjE4NjcgMTQ5%0D%0ALjI2NzkpIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiLz4NCgkJCQ0KCQkJCTx1c2UgeGxpbms6%0D%0AaHJlZj0iI05ld19TeW1ib2wiICB3aWR0aD0iMTIiIGhlaWdodD0iNDkiIHg9Ii02IiB5PSItMjQu%0D%0ANSIgdHJhbnNmb3JtPSJtYXRyaXgoLTAuOTM0NCAwLjM1NjEgMC4zNTYxIDAuOTM0NCAxMTEuMTUx%0D%0AIDI5Ljc4NTUpIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiLz4NCgkJCQ0KCQkJCTx1c2UgeGxp%0D%0Abms6aHJlZj0iI05ld19TeW1ib2wiICB3aWR0aD0iMTIiIGhlaWdodD0iNDkiIHg9Ii02IiB5PSIt%0D%0AMjQuNSIgdHJhbnNmb3JtPSJtYXRyaXgoMC45ODM0IC0wLjE4MTIgLTAuMTgxMiAtMC45ODM0IDIx%0D%0AMi41NTA1IDEyNy45MzAzKSIgc3R5bGU9Im92ZXJmbG93OnZpc2libGU7Ii8+DQoJCQkNCgkJCQk8%0D%0AdXNlIHhsaW5rOmhyZWY9IiNOZXdfU3ltYm9sIiAgd2lkdGg9IjEyIiBoZWlnaHQ9IjQ5IiB4PSIt%0D%0ANiIgeT0iLTI0LjUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNjM5OSAtMC43Njg0IC0wLjc2ODQgLTAu%0D%0ANjM5OSAxMzIuNjc5MSAxODIuMDE1NykiIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQkJ%0D%0ADQoJCQkJPHVzZSB4bGluazpocmVmPSIjTmV3X1N5bWJvbCIgIHdpZHRoPSIxMiIgaGVpZ2h0PSI0%0D%0AOSIgeD0iLTYiIHk9Ii0yNC41IiB0cmFuc2Zvcm09Im1hdHJpeCgtMC45NTEyIC0wLjMwODUgLTAu%0D%0AMzA4NSAwLjk1MTIgMTEzLjE4NTggMTIzLjc0NTIpIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsi%0D%0ALz4NCgkJCQ0KCQkJCTx1c2UgeGxpbms6aHJlZj0iI05ld19TeW1ib2wiICB3aWR0aD0iMTIiIGhl%0D%0AaWdodD0iNDkiIHg9Ii02IiB5PSItMjQuNSIgdHJhbnNmb3JtPSJtYXRyaXgoLTAuMjA5MiAwLjk3%0D%0ANzkgMC45Nzc5IDAuMjA5MiAxNzkuNjYzNiA1Ny4yNTI3KSIgc3R5bGU9Im92ZXJmbG93OnZpc2li%0D%0AbGU7Ii8+DQoJCQkNCgkJCQk8dXNlIHhsaW5rOmhyZWY9IiNOZXdfU3ltYm9sIiAgd2lkdGg9IjEy%0D%0AIiBoZWlnaHQ9IjQ5IiB4PSItNiIgeT0iLTI0LjUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNjE2MyAw%0D%0ALjIgMC4yIC0wLjYxNjMgODMuMDg2OCAxNzQuOTYwOSkiIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxl%0D%0AOyIvPg0KCQkJDQoJCQkJPHVzZSB4bGluazpocmVmPSIjTmV3X1N5bWJvbCIgIHdpZHRoPSIxMiIg%0D%0AaGVpZ2h0PSI0OSIgeD0iLTYiIHk9Ii0yNC41IiB0cmFuc2Zvcm09Im1hdHJpeCgtMC40MzQ4IC0w%0D%0ALjU1MDYgLTAuNTUwNiAwLjQzNDggMTcuODQ2OSA3My44Mzc3KSIgc3R5bGU9Im92ZXJmbG93OnZp%0D%0Ac2libGU7Ii8+DQoJCQkNCgkJCQk8dXNlIHhsaW5rOmhyZWY9IiNOZXdfU3ltYm9sIiAgd2lkdGg9%0D%0AIjEyIiBoZWlnaHQ9IjQ5IiB4PSItNiIgeT0iLTI0LjUiIHRyYW5zZm9ybT0ibWF0cml4KDAuMjc2%0D%0AMyAtMC45NTQ5IC0wLjk1NDkgLTAuMjc2MyAxNDkuOTg0MiA4NC4yNzEpIiBzdHlsZT0ib3ZlcmZs%0D%0Ab3c6dmlzaWJsZTsiLz4NCgkJCQ0KCQkJCTx1c2UgeGxpbms6aHJlZj0iI05ld19TeW1ib2wiICB3%0D%0AaWR0aD0iMTIiIGhlaWdodD0iNDkiIHg9Ii02IiB5PSItMjQuNSIgdHJhbnNmb3JtPSJtYXRyaXgo%0D%0ALTAuNzkyNSAtMC4yMTU5IC0wLjIxNTkgMC43OTI1IDg4LjYxMiA5My4xODUxKSIgc3R5bGU9Im92%0D%0AZXJmbG93OnZpc2libGU7Ii8+DQoJCQkNCgkJCQk8dXNlIHhsaW5rOmhyZWY9IiNOZXdfU3ltYm9s%0D%0AIiAgd2lkdGg9IjEyIiBoZWlnaHQ9IjQ5IiB4PSItNiIgeT0iLTI0LjUiIHRyYW5zZm9ybT0ibWF0%0D%0Acml4KDAuODMyOCAtMS42NTIyIC0xLjY1MjIgLTAuODMyOCAxODYuMzMzNCAxNzYuNDM3NCkiIHN0%0D%0AeWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPg0KCQkJDQoJCQkJPHVzZSB4bGluazpocmVmPSIjTmV3%0D%0AX1N5bWJvbCIgIHdpZHRoPSIxMiIgaGVpZ2h0PSI0OSIgeD0iLTYiIHk9Ii0yNC41IiB0cmFuc2Zv%0D%0Acm09Im1hdHJpeCgwLjM3NCAtMS43MTEyIC0xLjcxMTIgLTAuMzc0IDIxLjE3NTggMTEyLjY3MDUp%0D%0AIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiLz4NCgkJCQ0KCQkJCTx1c2UgeGxpbms6aHJlZj0i%0D%0AI05ld19TeW1ib2wiICB3aWR0aD0iMTIiIGhlaWdodD0iNDkiIHg9Ii02IiB5PSItMjQuNSIgdHJh%0D%0AbnNmb3JtPSJtYXRyaXgoMC4zNzIyIC0wLjgyOTIgLTAuODI5MiAtMC4zNzIyIDEzLjk0MDcgMTU3%0D%0ALjgwNzEpIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4N%0D%0ACjwvc3ZnPg0K" width="250" />

#### Why

I was rewriting a website of mine. Was aiming for zero dependencies and the least amount of JavaScript to send over the wire. This is what came out.

#### What

It's a view library! Like React/Preact, Vue, or HyperApp. It's my fav bits from React and Vue smashed into one while staying very lean with respect to kb size (the ES6 build is 1.4 kb gzipped and minified).

#### Examples

ES5 'Hello, World!'

```html
<body></body>
<script src="//unpkg.com/wigly@latest"></script>
<script>
    var App = wigly.component({
        render() {
            return { children: "This is a triumph." };
        }
    })

    wigly.render(App, document.body);
</script>
```

JSX 'Hello, World!'

```javascript
import { h, component, render } from "wigly";

let App = component({
  render() {
    return <div>This is a triumph.</div>;
  }
});

render(App, document.body);
```

State, props, children, and events.

```javascript
import { h, component, render } from "wigly";

let InputContainer = component({
  data() {
    return { name: "" }; // initial state
  },

  handleInput(event) {
    this.setState(() => ({ name: event.target.value }));
  },

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <h2>
          {this.children}: {this.state.name || "____"}
        </h2>
        <input oninput={this.handleInput} />
      </div>
    );
  }
});

let App = component({
  render() {
    return <InputContainer title="Please enter your name below.">Your name is</InputContainer>;
  }
});

render(App, document.body);
```

Lifecycles.

```javascript
import { h, component, render } from "wigly";

let App = component({
  mounted(el) {
    // called after component has entered DOM.
  },

  updated(el) {
    // called after component has updated. I.e. after this.setState
    // has been called or after props/children change.
  },

  destroyed(el) {
    // called after component has left DOM.
  },

  render() {
    return <div>This is a triumph.</div>;
  }
});

render(App, document.body);
```
