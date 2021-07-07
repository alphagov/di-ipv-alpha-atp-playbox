export const addAutoInput = (
  req: Express.Request,
  name: string,
  type: AutoInputType,
  values: any
): void => {
  const autoInput = req.session.autoInput;

  const found = autoInput.items.find((item) => {
    return item.name == name;
  });
  if (!found) {
    const v = [];
    v.push(values);
    autoInput.items.push({ name, type, values: v });
  } else {
    const f = found;
    if (type == "list") {
      if (
        !found.values.find((item) => {
          return JSON.stringify(item) == JSON.stringify(values);
        })
      ) {
        f.values.push(values);
      }
    } else if (type == "fill") {
      const v = [];
      v.push(values);
      f.values = v;
    }
  }
  return;
};
