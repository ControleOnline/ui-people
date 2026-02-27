import Profile from '@controleonline/ui-people/src/react/pages/Profile';


const peopleRoutes = [
  {
    name: 'ProfilePage',
    component: Profile,
    options: {
      headerShown: true,
      headerBackVisible: false,
      showBottomToolBar: true,
      title: 'Perfil',
    },
    initialParams: {store: 'auth'},
  },
];

export default peopleRoutes;