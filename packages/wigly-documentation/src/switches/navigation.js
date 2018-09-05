let initial = {
  links: [
    { title: "Home", href: "/" },
    { title: "Documentation", href: "/docs" },
    { title: "Tutorial", href: "/tutorial" },
    { title: "Blog", href: "/blog" }
  ]
};

export default {
  _: ({ state = initial }) => state
};
