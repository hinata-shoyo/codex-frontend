import { useHistory } from 'react-router-dom';

import { usePost } from '../../hooks/useMutate';
import { getEncounterQueryKey } from '../../constants/queryKeys';

export default function usePostIndividual() {
  const history = useHistory();

  return usePost({
    url: '/individuals/',
    deriveData: ({ individualData, encounterGuids }) => ({
      ...individualData,
      encounters: encounterGuids.map(guid => ({ id: guid })),
    }),
    deriveFetchKeys: ({ encounterGuids }) =>
      encounterGuids.map(encounterGuid =>
        getEncounterQueryKey(encounterGuid),
      ),
    onSuccess: response => {
      const newIndividualGuid = response?.data?.guid;

      if (newIndividualGuid) {
        history.push(`/individuals/${newIndividualGuid}`);
      }
    },
  });
}
