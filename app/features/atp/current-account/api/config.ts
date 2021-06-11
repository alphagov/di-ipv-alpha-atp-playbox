export const getCurrentAccountAPI = (): string => {
  return (
    process.env.CURRENT_ACCOUNT_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
