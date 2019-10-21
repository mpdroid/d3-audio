export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  let n = 0;
  for (n = 0; n < arr.length - 1; n++) {
    let k = randomInt(n + 1, arr.length - 1);
    let t = arr[k];
    arr[k] = arr[n];
    arr[n] = t;
  }
}

// https://stackoverflow.com/questions/8069315/create-array-of-all-integers-between-two-numbers-inclusive-in-javascript-jquer
export function range(n) {
  return Array.from({ length: n }, (v, k) => k + 1);
}
