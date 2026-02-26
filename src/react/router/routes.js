import Profile from '@controleonline/ui-people/src/react/pages/Profile';
import CrmLayout from '@controleonline/ui-layout/src/react/layouts/CrmLayout';

import React from 'react';

const WrappedProfile = ({ navigation, route }) => (
  <CrmLayout navigation={navigation} route={route} showCompanyFilter={false}>
    <Profile navigation={navigation} route={route} />
  </CrmLayout>
);

const peopleRoutes = [
  {
    name: 'ProfilePage',
    component: WrappedProfile,
    options: {
      headerShown: true,
      title: 'Perfil',
      headerLeft: () => null,
      headerBackButtonMenuEnabled: false,
    },
    initialParams: { store: 'auth' },
  },
];

export default peopleRoutes;