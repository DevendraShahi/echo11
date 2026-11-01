/** Visitor-facing names shared by the header, footer and page metadata. */
export const navigation = {
  home: { name: "Home", href: "/" },
  work: { name: "Our work", href: "/work" },
  services: { name: "Services", href: "/services" },
  approaches: { name: "Make it yours", href: "/make-it-yours" },
  process: { name: "How we work", href: "/process" },
  about: { name: "About us", href: "/about" },
  showcase: { name: "Showcase", href: "/showcase" },
  contact: { name: "Start a project", href: "/contact" },
} as const;

export const primaryNavigation = [
  navigation.home,
  navigation.work,
  navigation.services,
  navigation.approaches,
  navigation.process,
  navigation.about,
];

export const footerNavigation = [
  {
    title: "Services",
    links: [
      { name: "Business websites", href: "/services#business-websites" },
      { name: "Website redesigns", href: "/services#website-redesigns" },
      { name: "Online stores", href: "/services#online-stores" },
    ],
  },
  {
    title: "Studio",
    links: [navigation.work, navigation.showcase, navigation.approaches, navigation.process, navigation.about],
  },
];
