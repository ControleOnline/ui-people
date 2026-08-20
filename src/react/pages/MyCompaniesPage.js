import React from 'react';
import People from '@controleonline/ui-people/src/react/pages/People';
import {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
} from '@controleonline/ui-people/src/react/utils/peopleLinkFilters';

/**
 * My Companies list page.
 * Uses a dedicated details route (MyCompanyDetails) so company self-service
 * does not share the /client-details URL used by CRM/client flows.
 */
const MyCompaniesPage = () => (
  <People
    context={{
      context: [ALL_PEOPLE_LINK_TYPES_KEY, ...HUMAN_COMPANY_LINK_TYPES],
      defaultContext: ALL_PEOPLE_LINK_TYPES_KEY,
      title: 'Minhas empresas',
      searchPlaceholder: 'Buscar empresa',
      emptyTitle: 'Nenhuma empresa encontrada',
      emptySearchTitle: 'Nenhuma empresa encontrada',
      emptySubtitle: 'Nenhum vinculo humano com empresa foi encontrado.',
      detailsRouteName: 'MyCompanyDetails',
      detailsRouteParams: (client, selectedLinkType) => {
        const clientId = String(client?.id || client?.['@id'] || '').replace(/\D/g, '');
        return {
          clientId,
          contextKey:
            selectedLinkType === ALL_PEOPLE_LINK_TYPES_KEY
              ? 'company'
              : String(selectedLinkType || 'company'),
        };
      },
    }}
    companyScope="companies"
  />
);

export default MyCompaniesPage;
