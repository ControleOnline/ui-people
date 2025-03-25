import Profile from '@controleonline/ui-people/src/react/pages/Profile';
import ShopLayout from '@controleonline/ui-layout/src/react/layouts/ShopLayout';

import React from 'react';

const WrappedProfile = ({navigation, route}) => (
  <ShopLayout navigation={navigation} route={route}>
    <Profile navigation={navigation} route={route} />
  </ShopLayout>
);

const peopleRoutes = [
  {
    name: 'ProfilePage',
    component: WrappedProfile,
    options: {
      headerShown: true,
      title: 'Perfil',
      headerBackButtonMenuEnabled: false,
    },
    initialParams: {store: 'auth'},
  },
];

export default peopleRoutes;
