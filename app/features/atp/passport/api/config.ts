export const getPassportAPI = (): string => {
  return (
    process.env.PASSPORT_API ||
    "https://di-ipv-dcs-atp-service.london.cloudapps.digital/process"
  );
};
