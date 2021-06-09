export const getDrivingLicenceAPI = (): string => {
  return (
    process.env.DRIVING_LICENCE_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
