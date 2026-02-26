import { api } from "@controleonline/ui-common/src/api";
import { APP_ENV } from "../../../../../../config/env";
import * as customTypes from "./mutation_types";
import * as types from "@controleonline/ui-default/src/store/default/mutation_types";

const RESOURCE_ENDPOINT = "/people";

const unwrapResponseData = (data) => data?.response?.data ?? data?.data ?? data;

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.member)) return payload.member;
  if (Array.isArray(payload["hydra:member"])) return payload["hydra:member"];
  if (Array.isArray(payload.items)) return payload.items;

  return [];
};

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
      const companies = normalizeCollection(unwrapResponseData(data));
      commit(types.SET_ISLOADING, false);
      commit(customTypes.SET_COMPANIES, companies);
      setCurrentCompany({ commit, getters });
      return companies;
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
      const company = unwrapResponseData(data) || {};
      commit(customTypes.SET_DEFAULT_COMPANY, company);

      if (
        company?.id &&
        (!getters.currentCompany || !getters.currentCompany.id)
      ) {
        commit(customTypes.SET_CURRENT_COMPANY, company);
      }

      return company;
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
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const companies = Array.isArray(getters.companies) ? getters.companies : [];
  const defaultCompany = getters.defaultCompany || {};

  let selectedId = company?.id ?? session.mycompany ?? null;

  if (!selectedId && companies.length > 0) {
    const firstEnabled = companies.find((item) => item?.enabled !== false);
    selectedId = firstEnabled?.id ?? companies[0]?.id ?? null;
  }

  let currentCompany =
    companies.find((item) => String(item?.id) === String(selectedId)) || null;

  if (!currentCompany && company && typeof company === "object") {
    currentCompany = company;
  }

  if (
    !currentCompany &&
    defaultCompany?.id &&
    String(defaultCompany.id) === String(selectedId)
  ) {
    currentCompany = defaultCompany;
  }

  if (
    currentCompany &&
    (!currentCompany?.theme || !currentCompany?.theme?.colors) &&
    defaultCompany?.id &&
    String(defaultCompany.id) === String(currentCompany.id) &&
    defaultCompany?.theme
  ) {
    currentCompany = {
      ...currentCompany,
      theme: defaultCompany.theme,
      logo: currentCompany.logo || defaultCompany.logo,
      alias: currentCompany.alias || defaultCompany.alias,
      name: currentCompany.name || defaultCompany.name,
      configs: currentCompany.configs || defaultCompany.configs,
    };
  }

  if (currentCompany?.id) {
    commit(customTypes.SET_CURRENT_COMPANY, currentCompany);
    session.mycompany = currentCompany.id;
  } else {
    session.mycompany = selectedId || null;
  }

  localStorage.setItem("session", JSON.stringify(session));
};

export const getPeople = ({ commit }, id) => {
  return api
    .fetch(`${RESOURCE_ENDPOINT}/${id}`)

    .then((data) => {
      return data;
    });
};
