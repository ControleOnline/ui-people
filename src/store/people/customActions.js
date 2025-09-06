import { api } from "@controleonline/ui-common/src/api";
import { APP_ENV } from "../../../../../../config/env";
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

    .catch((e) => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const myCompanies = ({ commit, getters }, payload) => {
  commit(types.SET_ISLOADING, false);
  let url = `${RESOURCE_ENDPOINT}/companies/my`;
  return api
    .fetch(url)
    .then((data) => {
      commit(types.SET_ISLOADING, false);
      if (data.response?.data) {
        data.response.data.push({
          id: payload.user.id,
          alias: payload.user.realname,
          enabled: true,
          logo: null,
          permission: ["guest"],
          user: {
            alias: payload.user.realname,
            employee_enabled: true,
            enabled: true,
            id: payload.user.id,
            name: payload.user.realname,
            salesman_enabled: false,
          },
        });        
        commit(customTypes.SET_COMPANIES, data.response.data);
      }
      setCurrentCompany({ commit, getters });
      return data.response;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const defaultCompany = ({ commit, getters }) => {
  commit(types.SET_ISLOADING, false);

  const values = { "app-domain": APP_ENV.DOMAIN || location.host };

  return api
    .fetch(`${RESOURCE_ENDPOINT}/company/default`, { params: values })
    .then((data) => {
      commit(customTypes.SET_DEFAULT_COMPANY, data.response?.data);
      return data.response;
    })
    .catch((e) => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISLOADING, false);
    });
};

export const setCurrentCompany = ({ commit, getters }, company = null) => {
  let session = JSON.parse(localStorage.getItem("session") || "{}");
  let selected = company?.id || session.mycompany;
  let currentCompany;

  for (let index in getters.companies) {
    let item = getters.companies[index];
    if (item.enabled && !selected) {
      selected = item;
    }
  }

  if (selected != -1) {
    currentCompany = getters.companies.find(
      (companies) => companies.id === selected
    );
  } else {
    currentCompany = selected;
  }

  if (currentCompany) {
    commit(customTypes.SET_CURRENT_COMPANY, currentCompany);
  }

  session.mycompany = selected;
  localStorage.setItem("session", JSON.stringify(session));
};

export const getPeople = ({ commit }, id) => {
  return api
    .fetch(`${RESOURCE_ENDPOINT}/${id}`)

    .then((data) => {
      return data;
    });
};
