/** Content data for the LALTIN showcase route. Room facts stay provisional —
 *  verified with the property before anything here is presented as final. */

export type RoomKey = "cottage" | "valley" | "suite" | "family";

export const ROOMS: Record<
  RoomKey,
  {
    index: string;
    name: string;
    desc: string;
    facts: string[];
    amenities: string[];
    img: string;
    crop: string;
  }
> = {
  cottage: {
    index: "01 / 04",
    name: "Forest Cottage",
    desc: "A single room at the treeline, with its own terrace and the forest close enough to hear.",
    facts: ["2 guests", "King bed", "Private terrace"],
    amenities: ["Cottage", "Terrace", "Forest side"],
    img: "/showcase/laltin/Forest-Cottage.webp",
    crop: "64% 30%",
  },
  valley: {
    index: "02 / 04",
    name: "Valley House",
    desc: "Two rooms under one roof, opening toward the valley and the long view west.",
    facts: ["4 guests", "Two rooms", "Valley view"],
    amenities: ["Two rooms", "Valley view", "House"],
    img: "/showcase/laltin/Valley-House.webp",
    crop: "38% 52%",
  },
  suite: {
    index: "03 / 04",
    name: "Laltin Suite",
    desc: "The largest room on the property, with a separate sitting area and a terrace of its own.",
    facts: ["2 guests", "Separate sitting", "Terrace"],
    amenities: ["Suite", "Sitting room", "Terrace"],
    img: "/showcase/laltin/Laltin-Suite.webp",
    crop: "70% 40%",
  },
  family: {
    index: "04 / 04",
    name: "Family Retreat",
    desc: "Two bedrooms around a shared lounge, arranged for slow family mornings.",
    facts: ["4–5 guests", "Two bedrooms", "Shared lounge"],
    amenities: ["Two bedrooms", "Shared lounge", "Family"],
    img: "/showcase/laltin/Family-Retreat.webp",
    crop: "34% 44%",
  },
};

export const ROOM_LAYOUT: Array<{ key: RoomKey; mod: string; index: string; name: string; facts: string[] }> = [
  { key: "cottage", mod: "room--left", index: "01 / 04", name: "Forest Cottage", facts: ["2 guests", "King bed", "Private terrace"] },
  { key: "valley", mod: "room--right", index: "02 / 04", name: "Valley House", facts: ["4 guests", "Two rooms", "Valley view"] },
  { key: "suite", mod: "room--bleed", index: "03 / 04", name: "Laltin Suite", facts: ["2 guests", "Separate sitting", "Terrace"] },
  { key: "family", mod: "room--center", index: "04 / 04", name: "Family Retreat", facts: ["4–5 guests", "Two bedrooms", "Shared lounge"] },
];

export interface StayRoom {
  key: RoomKey;
  num: string;
  name: string;
  spec: string;
  alt: string;
  imageSrc: string;
}

export const STAY_ROOMS: StayRoom[] = [
  {
    key: "cottage",
    num: "01",
    name: "Forest Cottage",
    spec: "2 GUESTS · KING BED · PRIVATE TERRACE",
    alt: "A timber cottage with private deck overlooking Rara Lake",
    imageSrc: "/showcase/laltin/Forest-Cottage.webp",
  },
  {
    key: "valley",
    num: "02",
    name: "Valley House",
    spec: "4 GUESTS · TWO ROOMS · VALLEY VIEW",
    alt: "Two joined timber cottages opening toward the Rara valley view",
    imageSrc: "/showcase/laltin/Valley-House.webp",
  },
  {
    key: "suite",
    num: "03",
    name: "Laltin Suite",
    spec: "2 GUESTS · SEPARATE SITTING · TERRACE",
    alt: "A spacious timber suite and sitting lounge overlooking Rara Lake",
    imageSrc: "/showcase/laltin/Laltin-Suite.webp",
  },
  {
    key: "family",
    num: "04",
    name: "Family Retreat",
    spec: "4-5 GUESTS · TWO BEDROOMS · SHARED LOUNGE",
    alt: "A generous timber family lodge among the pines at Rara Lake",
    imageSrc: "/showcase/laltin/Family-Retreat.webp",
  },
];

export const ROOM_IMGS: Record<RoomKey, string> = {
  cottage: "/showcase/laltin/Forest-Cottage.webp",
  valley: "/showcase/laltin/Valley-House.webp",
  suite: "/showcase/laltin/Laltin-Suite.webp",
  family: "/showcase/laltin/Family-Retreat.webp",
};

export const ROOM_WEBP: Record<RoomKey, string> = {
  cottage: "/showcase/laltin/Forest-Cottage.webp",
  valley: "/showcase/laltin/Valley-House.webp",
  suite: "/showcase/laltin/Laltin-Suite.webp",
  family: "/showcase/laltin/Family-Retreat.webp",
};

export const ROOM_DIMS: Record<RoomKey, { w: number; h: number }> = {
  cottage: { w: 1023, h: 681 },
  valley: { w: 2200, h: 1650 },
  suite: { w: 2200, h: 1467 },
  family: { w: 2200, h: 1650 },
};

export const EXPERIENCES = [
  {
    id: "forest",
    label: "Walk the forest",
    mobileImg: "/laltin/assets/img/exp-forest.jpg",
    mobileWebp: "/laltin/assets/img/exp-forest.webp",
    alt: "A trail running into oak forest",
    caption:
      "The trail begins beyond the last cottage. From there, the forest takes over — oak, birdsong, damp earth and long stretches where nobody needs to say anything.",
  },
  {
    id: "village",
    label: "Follow the village trail",
    mobileImg: "/laltin/assets/img/exp-village.jpg",
    mobileWebp: "/laltin/assets/img/exp-village.webp",
    alt: "Terraced farms and footpaths on the hillside",
    caption:
      "Walk beyond the resort and the landscape becomes everyday life: farms, footpaths, homes and people who have shaped this hillside for generations.",
  },
  {
    id: "garden",
    label: "Eat from the garden",
    mobileImg: "/laltin/assets/img/exp-garden.jpg",
    mobileWebp: "/laltin/assets/img/exp-garden.webp",
    alt: "Hands lifting greens from a kitchen garden",
    caption:
      "Everything in the kitchen begins a few steps from it. What is ready in the morning decides what is cooked that night.",
  },
  {
    id: "river",
    label: "Find the river",
    mobileImg: "/laltin/assets/img/exp-river.jpg",
    mobileWebp: "/laltin/assets/img/exp-river.webp",
    alt: "Water moving over stone in the riverbed",
    caption:
      "The way down is not signposted. You hear the water before you see it — a low sound over stone, getting closer.",
  },
  {
    id: "fire",
    label: "Stay by the fire",
    mobileImg: "/laltin/assets/img/exp-fire.jpg",
    mobileWebp: "/laltin/assets/img/exp-fire.webp",
    alt: "Fire holding a circle of light after dark",
    caption:
      "When daylight leaves the valley, Laltin becomes what its name promises. Fires are lit, lanterns come on, and dinner slows into evening.",
  },
] as const;

export const STORIES: Record<string, { cat: string; title: string }> = {
  monsoon: { cat: "Place", title: "When the monsoon reaches the forest" },
  kitchen: { cat: "Food", title: "A morning with our kitchen" },
  path: { cat: "Walks", title: "The path beyond Laltin" },
};

export const MENU_LINKS = [
  { idx: "01", label: "Stay", href: "#stay", bg: "stay" as const },
  { idx: "02", label: "Experience", href: "#experience", bg: null },
  { idx: "03", label: "Eat", href: "#eat", bg: "eat" as const },
  { idx: "04", label: "Place", href: "#place", bg: "place" as const },
  { idx: "05", label: "Story", href: "#people", bg: null },
  { idx: "06", label: "Journal", href: "#journal", bg: null },
];
