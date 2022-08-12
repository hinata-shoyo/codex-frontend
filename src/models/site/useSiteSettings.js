import useFetch from '../../hooks/useFetch';
import queryKeys from '../../constants/queryKeys';

export default function useSiteSettings() {
  return useFetch({
    queryKey: queryKeys.settingsSchema2,
    url: '/site-settings/data',
    dataAccessor: result =>
      result?.data?.data?.response?.configuration,
    queryOptions: {},
  });
}
