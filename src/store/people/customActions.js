import { api } from "@controleonline/../../src/boot/api";

import * as customTypes from "./mutation_types";
import * as types from "@controleonline/ui-default/src/store/default/mutation_types";

const RESOURCE_ENDPOINT = "/people";

export const company = ({ commit }, values) => {
  commit(types.SET_ERROR, "");
  commit(types.SET_ISLOADING);

  return api
    .fetch(RESOURCE_ENDPOINT, { method: "POST", body: values })
    .then((response) => {
      commit(types.SET_ISLOADING, false);

      return response;
    })
    .then((data) => {
      if (data.response && data.response.success) {
        if (data.response.data)
          commit(customTypes.SET_COMPANY, {
            id: data.response.data.people.id,
          });
      }

      return data.response ? data.response : null;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      if (e instanceof Error) throw new Error(e.errors._error);

      throw new Error(e.message);
    });
};

export const myCompanies = ({ commit, dispatch }) => {
  commit(types.SET_ISLOADING, false);

  return api
    .fetch(`${RESOURCE_ENDPOINT}/companies/my`)

    .then((data) => {
      commit(types.SET_ISLOADING, false);

      if (data.response) {
        commit(customTypes.SET_COMPANIES, data.response.data);
      }

      return data.response;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);

      dispatch("auth/logOut", null, { root: true });
      localStorage.remove("session");
      //location.reload();
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const defaultCompany = ({ commit, dispatch }) => {
  commit(types.SET_ISLOADING, false);

  return api
    .fetch(`${RESOURCE_ENDPOINT}/company/default`)
    .then((data) => {
      commit(customTypes.SET_DEFAULT_COMPANY, data.response.data);
      return data.response;
    })
    .catch((e) => {
      dispatch("auth/logOut", null, { root: true });
      localStorage.remove("session");
      // location.reload();
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISLOADING, false);
    });
};

export const currentCompany = ({ commit }, company) => {
  if (company) {
    commit(customTypes.SET_CURRENT_COMPANY, company);
  }
};

export const getPeople = ({ commit }, id) => {
  return api
    .fetch(`${RESOURCE_ENDPOINT}/${id}`)

    .then((data) => {
      return data;
    });
};
