export const addToFill = (
  req: Express.Request,
  name: string,
  values: any
): void => {
  const autoInput = req.session.autoInput;

  const found = autoInput.items.find((item) => {
    return item.name == name;
  });
  if (!found) {
    const v = [];
    v.push(values);
    autoInput.items.push({ name, type: "fill", values: v });
  } else {
    const newValues = [];
    newValues.push(values);
    found.values = newValues;
  }
  return;
};

export const addToList = (
  req: Express.Request,
  name: string,
  values: any
): void => {
  const autoInput = req.session.autoInput;

  const found = autoInput.items.find((item) => {
    return item.name == name;
  });
  if (!found) {
    const v = [];
    v.push(values);
    autoInput.items.push({ name, type: "list", values: v });
  } else {
    if (
      !found.values.find((item) => {
        return JSON.stringify(item) == JSON.stringify(values);
      })
    ) {
      found.values.push(values);
    }
  }
  return;
};
