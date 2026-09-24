const {beforeEach, describe, expect, it, jest} = require('@jest/globals');

jest.mock('@controleonline/ui-common/src/api', () => ({api: {fetch: jest.fn()}}));
jest.mock('@controleonline/ui-default/src/store/default/actions', () => ({
  mainCompany: {legacy: true},
}));

const {api} = require('@controleonline/ui-common/src/api');
const people = require('@controleonline/ui-people/src/store/people').default;
const {SET_MAIN_COMPANY} = require('@controleonline/ui-people/src/store/people/mutation_types');

const domainCompany = {id: 1, name: 'Domain A', theme: {colors: {primary: 'red'}}};
let state;
let session;
let context;
beforeEach(() => {
  jest.clearAllMocks();
  state = {...people.state, mainCompany: {}, currentCompany: {id: 2}, companies: [{id: 2}, {id: 3}]};
  session = JSON.stringify({mycompany: 2});
  global.localStorage = {
    getItem: jest.fn(() => session),
    setItem: jest.fn((_key, value) => { session = value; }),
  };
  context = {
    getters: state,
    commit: (type, value) => people.mutations[type](state, value),
  };
});

describe('domain company contract', () => {
  it('loads mainCompany through the unchanged HTTP route without changing the selection', async () => {
    api.fetch.mockResolvedValue({response: {data: domainCompany}});
    expect(typeof people.actions.mainCompany).toBe('function');
    expect(await people.actions.mainCompany(context)).toEqual(domainCompany);
    expect(api.fetch).toHaveBeenCalledWith('/people/company/default');
    expect(people.getters.mainCompany(state)).toEqual(domainCompany);
    expect(people.getters.currentCompany(state)).toEqual({id: 2});
    expect(JSON.parse(session).mycompany).toBe(2);
  });

  it('keeps domain A while selecting B, switching to C and restoring the session', () => {
    context.commit(SET_MAIN_COMPANY, domainCompany);
    people.actions.setCurrentCompany(context, {id: 2});
    people.actions.setCurrentCompany(context, {id: 3});
    expect(state.currentCompany.id).toBe(3);
    expect(JSON.parse(session).mycompany).toBe(3);
    state.currentCompany = {};
    people.actions.setCurrentCompany(context);
    expect(state.currentCompany).toEqual({id: 3});
    expect(state.mainCompany).toEqual(domainCompany);
    expect(state.currentCompany.theme).toBeUndefined();
  });

  it('keeps the domain company and selection intact when loading fails', async () => {
    context.commit(SET_MAIN_COMPANY, domainCompany);
    api.fetch.mockRejectedValue(new Error('offline'));
    await expect(people.actions.mainCompany(context)).rejects.toThrow('offline');
    expect(state.mainCompany).toEqual(domainCompany);
    expect(state.currentCompany.id).toBe(2);
    expect(state.error).toBe('offline');
  });
});
