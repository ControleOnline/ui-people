import Profile from '@controleonline/ui-people/src/react/pages/Profile';


const peopleRoutes = [
  {
    name: 'ProfilePage',
    component: Profile,
    options: {
      headerShown: true,
      title: 'Perfil',
      headerBackButtonMenuEnabled: false,
    },
    initialParams: {store: 'auth'},
  },
];

export default peopleRoutes;