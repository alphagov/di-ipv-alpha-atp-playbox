export const getGenericJSONAPI = (): string => {
  return (
    process.env.GENERIC_JSON_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
