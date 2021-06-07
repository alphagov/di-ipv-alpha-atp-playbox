export const getBasicInfoAPI = (): string => {
  return (
    process.env.BASIC_INFO_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
