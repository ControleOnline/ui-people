import React from 'react';
import People from '@controleonline/ui-people/src/react/pages/People';
import {
  ALL_PEOPLE_LINK_TYPES_KEY,
  HUMAN_COMPANY_LINK_TYPES,
} from '@controleonline/ui-people/src/react/utils/peopleLinkFilters';

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
    }}
    companyScope="companies"
  />
);

export default MyCompaniesPage;
