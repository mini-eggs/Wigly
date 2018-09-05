import connect from "../store";

export default connect(
  state => ({ ...state.search }),
  dispatch => ({})
);
