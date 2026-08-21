import { useEffect, useState } from 'react';
import { useMessage } from '@controleonline/ui-common/src/react/components/MessageService';
import {
  toPeopleIri,
  buildExistingOwnerLabel,
} from '@controleonline/ui-people/src/react/utils/addCompanyFormHelpers';

/**
 * Loads franchise owner candidates when the modal is in franchisee context.
 */
export const useExistingOwnerOptions = ({
  visible,
  canSelectExistingOwner,
  currentCompanyId,
  loadCandidates,
}) => {
  const { showError } = useMessage();
  const [existingOwnerOptions, setExistingOwnerOptions] = useState([]);
  const [isLoadingExistingOwners, setIsLoadingExistingOwners] = useState(false);

  useEffect(() => {
    if (!visible || !canSelectExistingOwner || !currentCompanyId) {
      setExistingOwnerOptions([]);
      setIsLoadingExistingOwners(false);
      return;
    }

    let cancelled = false;

    const loadExistingOwners = async () => {
      setIsLoadingExistingOwners(true);
      try {
        const response = await loadCandidates({ companyId: currentCompanyId });
        const ownerOptions = (response || []).map(owner => ({
          value: toPeopleIri(owner),
          label: buildExistingOwnerLabel(owner),
        }));
        if (!cancelled) {
          setExistingOwnerOptions(
            ownerOptions
              .filter(option => option.value)
              .sort((left, right) => left.label.localeCompare(right.label)),
          );
        }
      } catch {
        if (!cancelled) {
          setExistingOwnerOptions([]);
        }
        showError(global.t?.t('people', 'error', 'franchiseOwnerCandidatesLoadFailed'));
      } finally {
        if (!cancelled) {
          setIsLoadingExistingOwners(false);
        }
      }
    };

    loadExistingOwners();
    return () => {
      cancelled = true;
    };
  }, [visible, canSelectExistingOwner, currentCompanyId, loadCandidates, showError]);

  return { existingOwnerOptions, isLoadingExistingOwners };
};

export default useExistingOwnerOptions;
