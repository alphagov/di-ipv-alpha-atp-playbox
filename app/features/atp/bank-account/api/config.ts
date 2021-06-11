export const getBankAccountAPI = (): string => {
  return (
    process.env.BANK_ACCOUNT_API ||
    "https://di-ipv-generic-atp-service.london.cloudapps.digital/process"
  );
};
