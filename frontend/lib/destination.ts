// Build a loremflickr keyword URL for a destination, used for hand-drawn
// rough-cut hero images. Keeps the home page and trip detail page consistent.

export function getDestinationImageUrl(destination: string) {
  const keyword = destination
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, "")
    .replace(/\s+/g, ",")
    .replace(/,+/g, ",");
  return `https://loremflickr.com/1600/900/${keyword || "travel"},travel,landmark`;
}
