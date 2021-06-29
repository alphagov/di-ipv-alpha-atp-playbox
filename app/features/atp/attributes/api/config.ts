export const getAttributesAPI = (): string => {
  return (
    process.env.ATTRIBUTES_JSON_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
