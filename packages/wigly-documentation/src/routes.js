// import discover from "./scenes/discover";
// import documentation from "./scenes/documentation";
// import blog from "./scenes/blog";
// import tutorial from "./scenes/tutorial";

// export default [["/", discover], ["/docs", documentation], ["/tutorial", tutorial], ["/blog", blog]];

import discover from "./scenes/discover";

export default [
  ["/", () => discover],
  ["/docs", () => import("./scenes/documentation")],
  ["/tutorial", () => import("./scenes/tutorial")],
  ["/blog", () => import("./scenes/blog")]
];
