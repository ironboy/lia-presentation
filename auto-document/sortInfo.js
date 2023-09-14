export function sortInfo(all) {
  all.sort((a, b) => {
    return a.uses.includes(b) ? -1 : 0;
  });
}