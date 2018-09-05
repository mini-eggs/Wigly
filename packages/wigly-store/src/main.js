export default switches => {
  let subscriptionIndex = 0;
  let subs = [];

  let calc = (curr, type, payload) => {
    return Object.keys(switches).reduce(
      (total, key) => {
        let f = switches[key][type] || (() => ({}));
        let partial;
        if (curr[key]) partial = { ...curr[key] };
        return { ...total, [key]: { ...(partial || {}), ...(f({ ["state"]: partial, ["payload"]: payload }) || {}) } };
      },
      { ...curr }
    );
  };

  let state = calc({}, "_", undefined);

  return {
    ["getState"]: () => {
      return { ...state };
    },
    ["dispatch"]: (key, payload) => {
      state = calc(state, key, payload);
      for (let f of subs) f({ ...state });
    },
    ["subscribe"]: f => {
      let index = subscriptionIndex++;
      subs.push(f);
      return () => (subs = subs.filter((_, i) => i !== index));
    }
  };
};
