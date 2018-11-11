// @jsx wigly.h
import wigly, { useState, useEffect } from "../";
import "babel-polyfill";

function App(props) {
  var [username, setUsername] = useState();
  var [error, setError] = useState();

  useEffect(
    async function() {
      try {
        var request = await fetch(`/get/user/${props.userId}`);
        var result = await request.json();
        setUsername(result.username);
      } catch (e) {
        setError(e.toString());
      }
    },
    [props.userId]
  );

  return (
    <div>
      {(() => {
        switch (true) {
          case !!error: {
            return error;
          }
          case !!username: {
            return <h1>Username: {username}</h1>;
          }
          default: {
            return "loading...";
          }
        }
      })()}
    </div>
  );
}

wigly.render(<App userId={123} />, document.body);
