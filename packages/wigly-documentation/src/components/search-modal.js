import { h, component } from "wigly";
import SearchConnect from "../containers/search";

let Modal = component({
  render() {
    return (
      <div class="search-modal">
        <div>here we go</div>
      </div>
    );
  }
});

export default SearchConnect(Modal);
