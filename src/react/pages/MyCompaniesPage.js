import React from 'react';
import People from '@controleonline/ui-people/src/react/pages/People';

const MyCompaniesPage = () => (
  <People
    context={{
      context: ['client', 'prospect'],
      defaultContext: 'client',
      defaultPeopleType: 'J',
      title: 'Minhas empresas',
      searchPlaceholder: 'Buscar empresa',
      modalTitleByType: {
        client: global.t?.t('people', 'title', 'registerClient'),
        prospect: global.t?.t('people', 'title', 'registerProspect'),
      },
      emptyTitle: 'Nenhuma empresa encontrada',
      emptySearchTitle: 'Nenhuma empresa encontrada',
      emptySubtitle: 'Adicione a primeira empresa para começar.',
    }}
  />
);

export default MyCompaniesPage;
