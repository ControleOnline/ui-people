import {api} from '@controleonline/ui-common/src/api';

import * as customTypes from './mutation_types';
import * as types from '@controleonline/ui-default/src/store/default/mutation_types';

const RESOURCE_ENDPOINT = '/people';

export const company = ({commit}, values) => {
  commit(types.SET_ERROR, '');
  commit(types.SET_ISLOADING);

  return api
    .fetch(RESOURCE_ENDPOINT, {method: 'POST', body: values})
    .then(response => {
      commit(types.SET_ISLOADING, false);

      return response;
    })

    .catch(e => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const myCompanies = ({commit, dispatch}, device) => {
  commit(types.SET_ISLOADING, false);
  let url = `${RESOURCE_ENDPOINT}/companies/my`;
  if (device) url += `?device=${device}`;
  return api
    .fetch(url)
    .then(data => {
      commit(types.SET_ISLOADING, false);
      if (data.response?.data) {
        commit(customTypes.SET_COMPANIES, data.response.data);
        commit(customTypes.SET_CURRENT_COMPANY, data.response.data[0]);
      }
      return data.response;
    })
    .catch(e => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const defaultCompany = ({commit, dispatch}) => {
  commit(types.SET_ISLOADING, false);

  return api
    .fetch(`${RESOURCE_ENDPOINT}/company/default`)
    .then(data => {
      commit(customTypes.SET_DEFAULT_COMPANY, data.response?.data);
      return data.response;
    })
    .catch(e => {
      commit(types.SET_ERROR, e.message);
      throw e;
    })
    .finally(() => {
      commit(types.SET_ISLOADING, false);
    });
};

export const currentCompany = ({commit}, company) => {
  if (company) {
    commit(customTypes.SET_CURRENT_COMPANY, company);
  }
};

export const getPeople = ({commit}, id) => {
  return api
    .fetch(`${RESOURCE_ENDPOINT}/${id}`)

    .then(data => {
      return data;
    });
};
