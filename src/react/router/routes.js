import Profile from '@controleonline/ui-people/src/react/pages/Profile';
import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout';
// import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout';

import React from 'react';

const WrappedProfile = ({navigation, route}) => (
  <DefaultLayout navigation={navigation} route={route}>
    <Profile navigation={navigation} route={route} />
  </DefaultLayout>
);
// const WrappedProfile = ({navigation, route}) => (
//   <DefaultLayout navigation={navigation} route={route}>
//     <Profile navigation={navigation} route={route} />
//   </DefaultLayout>
// );

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