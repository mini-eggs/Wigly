let initial = {
  name: "Evan"
};

let InputReducer = (state = initial, action) => {
  switch (action.type) {
    case "UPDATE_NAME": {
      return { ...state, name: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default InputReducer;
