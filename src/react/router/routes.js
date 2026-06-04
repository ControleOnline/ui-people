import Profile from '@controleonline/ui-people/src/react/pages/Profile';


const peopleRoutes = [
  {
    name: 'ProfilePage',
    component: Profile,
    options: {
      headerShown: true,
      showBottomToolBar: true,
      title: () => global.t?.t('people', 'title', 'profile'),
    },
    initialParams: {store: 'auth'},
  },
];

export default peopleRoutes;
