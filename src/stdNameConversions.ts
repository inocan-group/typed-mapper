export function dasherize(name: string): string {
  return name
    .split(/[_\s\.]/g)
    .map(val => {
      return (
        val.charAt(0).toLowerCase() +
        val
          .substr(1)
          .replace(/([A-Z])/gm, "-$1")
          .toLowerCase()
      );
    })
    .join("-");
}

export function camelize(name: string): string {
  return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
    return agg !== ""
      ? agg + val.charAt(0).toUpperCase() + val.substr(1)
      : val.charAt(0).toLowerCase() + val.substr(1);
  }, "");
}

export function pascalize(name: string): string {
  return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
    return agg + val.charAt(0).toUpperCase() + val.substr(1);
  }, "");
}
