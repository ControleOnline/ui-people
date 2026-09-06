import { api } from "@controleonline/ui-common/src/api";
import {
  persistCurrentCompanyInSession,
  resolveCurrentCompanySelection,
} from '@controleonline/ui-people/src/react/utils/currentCompanySelection'
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

const extractId = value => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Plain numeric id (common from API hydra members and DefaultUpload rows)
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value === 'string') {
    const match = value.match(/(\d+)$/);
    return match ? match[1] : '';
  }

  // Object: prefer explicit mediaId, then id / @id
  const raw =
    value?.mediaId ??
    value?.id ??
    value?.['@id'] ??
    null;

  if (raw === null || raw === undefined || raw === '') {
    return '';
  }

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(Math.trunc(raw));
  }

  const match = String(raw).match(/(\d+)$/);
  return match ? match[1] : '';
};

const toPeopleIri = value => {
  const id = extractId(value);
  return id ? `/people/${id}` : '';
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

export const myCompanies = ({ commit, getters }, _payload) => {
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

export const myCompaniesByLinkType = (_context, payload = {}) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const params =
    normalizedPayload.params && typeof normalizedPayload.params === 'object'
      ? normalizedPayload.params
      : normalizedPayload;
  const requestOptions = Object.keys(params || {}).length > 0 ? { params } : {};

  return api
    .fetch(`${RESOURCE_ENDPOINT}/companies/my`, requestOptions)
    .then((data) => normalizeCollection(unwrapResponseData(data)))
    .catch((e) => {
      throw e;
    });
};

export const getMediaTypes = (_context, payload = {}) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const params = Object.keys(normalizedPayload).length > 0 ? normalizedPayload : {};

  return api
    .fetch('/media_types', { params })
    .then((data) => normalizeCollection(unwrapResponseData(data)))
    .catch((e) => {
      throw e;
    });
};

export const getPeopleMedia = (_context, payload = {}) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const params = Object.keys(normalizedPayload).length > 0 ? normalizedPayload : {};

  return api
    .fetch('/people_media', { params })
    .then((data) => normalizeCollection(unwrapResponseData(data)))
    .catch((e) => {
      throw e;
    });
};

export const uploadPeopleMedia = (_context, payload = {}) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const peopleIri = String(normalizedPayload.people || normalizedPayload.peopleIri || '')
    .trim() || toPeopleIri(normalizedPayload.peopleId);
  const mediaTypeId = extractId(normalizedPayload.mediaTypeId || normalizedPayload.mediaType);
  const file = normalizedPayload.file;

  if (!peopleIri || !file) {
    throw new Error('Nao foi possivel identificar a midia para envio.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('people', peopleIri);
  if (mediaTypeId) {
    formData.append('media_type_id', String(mediaTypeId));
  }

  return api
    .upload('/people_media/upload', formData)
    .then((data) => unwrapResponseData(data))
    .catch((e) => {
      throw e;
    });
};

export const savePeopleMedia = (_context, payload = {}) => {
  const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
  const peopleIri = String(normalizedPayload.people || normalizedPayload.peopleIri || '')
    .trim() || toPeopleIri(normalizedPayload.peopleId);
  const mediaTypeIri = String(normalizedPayload.mediaType || normalizedPayload.mediaTypeIri || '')
    .trim() || (extractId(normalizedPayload.mediaTypeId) ? `/media_types/${extractId(normalizedPayload.mediaTypeId)}` : '');
  const fileIri = String(normalizedPayload.file || normalizedPayload.fileIri || '')
    .trim() || (extractId(normalizedPayload.fileId) ? `/files/${extractId(normalizedPayload.fileId)}` : '');
  const mediaId = extractId(normalizedPayload.id || normalizedPayload.mediaId);

  if (!peopleIri || !mediaTypeIri || !fileIri) {
    throw new Error('Nao foi possivel identificar a midia para salvar.');
  }

  return api
    .fetch(mediaId ? `/people_media/${mediaId}` : '/people_media', {
      method: mediaId ? 'PUT' : 'POST',
      body: {
        people: peopleIri,
        mediaType: mediaTypeIri,
        file: fileIri,
      },
    })
    .then((data) => unwrapResponseData(data))
    .catch((e) => {
      throw e;
    });
};

export const deletePeopleMedia = (_context, payload = {}) => {
  const mediaId = extractId(payload?.mediaId || payload);

  if (!mediaId) {
    throw new Error('Nao foi possivel identificar a midia para exclusao.');
  }

  return api
    .fetch(`/people_media/${mediaId}`, { method: 'DELETE' })
    .then((data) => unwrapResponseData(data))
    .catch((e) => {
      throw e;
    });
};

export const defaultCompany = ({ commit }) => {
  commit(types.SET_ISLOADING, false);

  return api
    .fetch(`${RESOURCE_ENDPOINT}/company/default`)
    .then((data) => {
      const company = unwrapResponseData(data) || {};
      commit(customTypes.SET_DEFAULT_COMPANY, company);

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

export const franchiseOwnerCandidates = ({ commit }, values = {}) => {
  commit(types.SET_ERROR, "");
  commit(types.SET_ISLOADING);

  return api
    .fetch(`${RESOURCE_ENDPOINT}/franchise-owner-candidates`, {
      params: {
        companyId: values.companyId,
      },
    })
    .then((data) => {
      commit(types.SET_ISLOADING, false);
      return normalizeCollection(unwrapResponseData(data));
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const setCurrentCompany = ({ commit, getters }, company = null) => {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const companies = Array.isArray(getters.companies) ? getters.companies : [];
  const defaultCompany = getters.defaultCompany || {};

  const currentCompany = resolveCurrentCompanySelection({
    companies,
    company,
    defaultCompany,
    session,
  });

  if (currentCompany?.id) {
    commit(customTypes.SET_CURRENT_COMPANY, currentCompany);
    localStorage.setItem(
      "session",
      JSON.stringify(persistCurrentCompanyInSession(session, currentCompany)),
    );
  } else {
    commit(customTypes.SET_CURRENT_COMPANY, {});
    localStorage.setItem(
      "session",
      JSON.stringify(persistCurrentCompanyInSession(session, null)),
    );
  }
};

export const getPeople = (_context, id) => {
  return api
    .fetch(`${RESOURCE_ENDPOINT}/${id}`)

    .then((data) => {
      return data;
    });
};


const CONTACT_KEYS = [
  'email',
  'phone',
  'ddd',
  'cep',
  'street',
  'number',
  'complement',
  'district',
  'city',
  'state',
];

const pickContactFields = (params) => {
  const source = params && typeof params === 'object' ? params : {};
  const contact = {};
  CONTACT_KEYS.forEach((key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      contact[key] = source[key];
    }
  });
  return contact;
};

const stripContactFields = (params) => {
  const next = { ...(params && typeof params === 'object' ? params : {}) };
  CONTACT_KEYS.forEach((key) => {
    delete next[key];
  });
  return next;
};

const extractPeopleId = (data) => {
  const payload = unwrapResponseData(data) || data;
  return extractId(payload);
};

const persistPeopleContacts = (peopleId, contact) => {
  const peopleIri = toPeopleIri(peopleId);
  if (!peopleIri) return Promise.resolve();

  const jobs = [];
  const email = String(contact.email || '').trim();
  if (email) {
    jobs.push(
      api.fetch('/emails', {
        method: 'POST',
        body: { email, people: peopleIri },
      }),
    );
  }

  const phoneDigits = String(contact.phone || '').replace(/\D/g, '');
  if (phoneDigits) {
    const ddd = String(contact.ddd || phoneDigits.slice(0, 2));
    const phone = phoneDigits.length > 2 ? phoneDigits.slice(2) : phoneDigits;
    jobs.push(
      api.fetch('/phones', {
        method: 'POST',
        body: { ddd, phone, people: peopleIri },
      }),
    );
  }

  const cep = String(contact.cep || '').replace(/\D/g, '');
  const street = String(contact.street || '').trim();
  if (cep || street) {
    jobs.push(
      api.fetch('/addresses', {
        method: 'POST',
        body: {
          people: peopleIri,
          cep,
          street,
          number: contact.number || '',
          complement: contact.complement || '',
          district: contact.district || '',
          city: contact.city || '',
          state: contact.state || '',
        },
      }),
    );
  }

  if (!jobs.length) return Promise.resolve();
  return Promise.allSettled(jobs);
};

export const savePeopleCore = ({ commit }, params) => {
  const requestParams = params && typeof params === 'object' ? params : {};
  let id = requestParams?.id?.toString().replace(/\D/g, '');
  const body = { ...requestParams };
  delete body.id;

  commit(types.SET_ISLOADING);
  commit(types.SET_ERROR, '');

  return api
    .fetch(RESOURCE_ENDPOINT + (id ? '/' + id : ''), {
      method: id ? 'PUT' : 'POST',
      body,
    })
    .then((data) => {
      commit(types.SET_ISLOADING, false);
      return data;
    })
    .catch((e) => {
      commit(types.SET_ISLOADING, false);
      commit(types.SET_ERROR, e.message);
      throw e;
    });
};

export const save = ({ dispatch }, params) => {
  const requestParams = params && typeof params === 'object' ? params : {};
  const contact = pickContactFields(requestParams);
  const peoplePayload = stripContactFields(requestParams);

  return dispatch('savePeopleCore', peoplePayload).then((data) => {
    const peopleId = extractPeopleId(data) || extractId(requestParams.id);
    return persistPeopleContacts(peopleId, contact).then(() => data);
  });
};
