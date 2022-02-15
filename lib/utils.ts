export function isPxStr(val: string | number) {
  return /^[0-9]+(?:px)*$/.test(val + "");
}

export function px(v: string | number) {
  return typeof v === "number" ? v + "px" : v;
}

export function str(v: string | number) {
  return v + "";
}

export function percOrPx(v: string | number) {
  return typeof v === "number"
    ? v <= 1
      ? v * 100 + "%"
      : v + "px"
    : isPxStr(v)
    ? px(parseInt(v))
    : v;
}
