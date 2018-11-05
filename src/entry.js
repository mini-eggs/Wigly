import { h, render, useState, useEffect } from "./main";

let pkg = {
  ["h"]: h,
  ["render"]: render,
  ["useState"]: useState,
  ["useEffect"]: useEffect
};

if (typeof module !== "undefined") {
  module["exports"] = pkg;
} else {
  window["wigly"] = pkg;
}
