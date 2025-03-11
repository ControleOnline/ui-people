export const routes = [
  {
    path: "/company/",
    component: () =>
      import("@controleonline/ui-layout/src/vue/layouts/AdminLayout.vue"),
    children: [
      {
        name: "CompanyIndex",
        path: "",
        component: () => import("../pages/Company"),
      },
      {
        name: "CompanyDetails",
        path: "id/:id",
        component: () => import("../pages/Details"),
      },
    ],
  },
];
