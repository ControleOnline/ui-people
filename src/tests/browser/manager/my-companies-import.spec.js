// fluxo: minhas-empresas-cadastro | etapa: company-import | wiki: https://github.com/ControleOnline/app-community/wiki/Venda-Producao
const {expect, test} = require('playwright/test');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');
const {version: appVersion} = require('../../../../../../../package.json');

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const collection = (member = [], summary = {}) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary,
});

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const textHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'text/css; charset=utf-8',
});

const createCompany = () => ({
  id: 3,
  name: 'Controle Online',
  alias: 'CONTROLE ONLINE',
  panel_enabled: true,
  enabled: true,
  commercial_enabled: true,
  theme: {
    colors: {
      primary: '#0EA5E9',
      secondary: '#F97316',
      buttonBackground: '#0EA5E9',
      buttonBorder: '#0284C7',
      buttonText: '#FFFFFF',
      cardBackground: '#FFFFFF',
      cardBorder: '#D8E0EA',
      cardIcon: '#0EA5E9',
      cardShadow: '#94A3B8',
      iconInverse: '#FFFFFF',
      listItemIcon: '#0EA5E9',
      listItemSubtitleText: '#64748B',
      listItemText: '#0F172A',
      tableActionBackground: '#0EA5E9',
      tableActionBorder: '#0284C7',
      tableActionIcon: '#FFFFFF',
    },
  },
  configs: {},
});

const createPeopleItem = () => ({
  '@id': '/people/41',
  id: 41,
  name: 'ACME LTDA',
  alias: 'ACME',
  peopleType: 'J',
  enable: true,
  link: {
    linkType: 'client',
    company: '/people/3',
  },
});

const mockMyCompaniesApi = async page => {
  const company = createCompany();
  const peopleItem = createPeopleItem();
  const peopleQueries = [];
  const detailRequests = [];

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
        body: '',
      });
    }

    if (pathname === 'themes-colors.css') {
      return route.fulfill({
        status: 200,
        headers: textHeaders(),
        body: ':root { --primary: #0ea5e9; --secondary: #f97316; }',
      });
    }

    if (pathname === 'runtime/ip') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({ip: '127.0.0.1'}),
      });
    }

    if (pathname === 'people/company/default') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'people/companies/my') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([company])),
      });
    }

    if (pathname === 'people' && method === 'GET') {
      peopleQueries.push({
        companyPeople: url.searchParams.get('company.people'),
        linkTypes: url.searchParams.getAll('company.linkType[]'),
        linkLinkType: url.searchParams.get('link.linkType'),
        linkCompany: url.searchParams.get('link.company'),
        search: url.searchParams.get('search'),
        query: url.search,
      });

      // Include nested company shape (list row that only exposes company.id) for #463.
      const nestedShape = {
        company: {
          '@id': '/people/55',
          id: 55,
          name: 'NESTED CO LTDA',
          alias: 'NESTED CO',
          peopleType: 'J',
          enable: true,
        },
        link: {linkType: 'owner', company: '/people/3'},
      };

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([peopleItem, nestedShape])),
      });
    }

    if (/^people\/\d+$/.test(pathname) && method === 'GET') {
      detailRequests.push(pathname);
      const id = Number(pathname.split('/')[1]);

      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(
          pathname === 'people/41'
            ? peopleItem
            : pathname === 'people/55'
              ? {
                  '@id': '/people/55',
                  id: 55,
                  name: 'NESTED CO LTDA',
                  alias: 'NESTED CO',
                  peopleType: 'J',
                  enable: true,
                }
              : {
                  ...peopleItem,
                  id,
                  '@id': `/${pathname}`,
                },
        ),
      });
    }

    if (pathname === 'imports' && method === 'GET') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([])),
      });
    }

    if (pathname.startsWith('imports/example/')) {
      return route.fulfill({
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'content-type': 'text/csv; charset=utf-8',
        },
        body: 'name\nACME LTDA',
      });
    }

    if (pathname === 'menus-people') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({modules: {}}),
      });
    }

    if (pathname === 'configs/discovery-configs') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {}}),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({appVersion}) => {
      const setLocalStorageItem = (key, value) => {
        try {
      localStorage.setItem(key, value);
        } catch {
          // Initial documents such as about:blank do not expose storage.
        }
      };

      setLocalStorageItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
          roles: ['ROLE_SUPER'],
        }),
      );
      setLocalStorageItem('config', JSON.stringify({language: 'pt-br'}));
      setLocalStorageItem('app-type', 'MANAGER');
      setLocalStorageItem(
        'device',
        JSON.stringify({
          id: 'web-manager',
          device: 'web-manager',
          type: 'WEB',
          appName: 'Browser Manager',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
    },
    {appVersion},
  );

  return {
    detailRequests,
    peopleQueries,
  };
};

test.describe('my companies page browser smoke', () => {
  test('shows my companies with people-link filters and opens details', async ({page}) => {
    const {detailRequests, peopleQueries} = await mockMyCompaniesApi(page);

    await page.goto('/my-companies-page');

    await expect(page.getByText('Minhas empresas', {exact: true})).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('ACME', {exact: true})).toBeVisible({timeout: 15000});
    await expect(page.getByText('ACME LTDA', {exact: true})).toBeVisible({timeout: 15000});
    await expect(page.getByText('Clients', {exact: true})).toHaveCount(0);
    await expect(page.getByText('Prospects', {exact: true})).toHaveCount(0);

    await expect.poll(() => peopleQueries.length).toBeGreaterThan(0);
    expect(peopleQueries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          companyPeople: '/people/7',
          linkTypes: expect.arrayContaining(['owner', 'employee', 'salesman']),
        }),
      ]),
    );

    await page.getByText('ACME', {exact: true}).first().click();
    await expect.poll(() => detailRequests.length).toBeGreaterThan(0);
    // Dedicated MyCompanyDetails route must be registered (not a silent no-op).
    await expect(page).toHaveURL(/my-company-details/i, {timeout: 10000});
  });

  // app-community#463 — rework smoke: click must navigate (no no-op), no pageerror
  test('click on company card navigates to MyCompanyDetails without pageerror (#463)', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error?.message || error)));

    const {detailRequests} = await mockMyCompaniesApi(page);
    await page.goto('/my-companies-page');

    await expect(page.getByText('Minhas empresas', {exact: true})).toBeVisible({
      timeout: 15000,
    });
    const companyCard = page.getByText('ACME', {exact: true}).first();
    await expect(companyCard).toBeVisible({timeout: 15000});

    await companyCard.click();

    await expect.poll(() => detailRequests.length, {timeout: 10000}).toBeGreaterThan(0);
    await expect(page).toHaveURL(/my-company-details/i, {timeout: 10000});
    // Must not stay on list route (would indicate silent no-op).
    await expect(page).not.toHaveURL(/my-companies-page/i);
    expect(pageErrors).toEqual([]);

    // Second company (nested company.id shape) — back then click.
    await page.goBack();
    await expect(page.getByText('Minhas empresas', {exact: true})).toBeVisible({
      timeout: 10000,
    });
    const nestedCard = page.getByText('NESTED CO', {exact: true}).first();
    await expect(nestedCard).toBeVisible({timeout: 10000});
    const beforeNested = detailRequests.length;
    await nestedCard.click();
    await expect
      .poll(() => detailRequests.length, {timeout: 10000})
      .toBeGreaterThan(beforeNested);
    await expect(page).toHaveURL(/my-company-details/i, {timeout: 10000});
    await expect(page).not.toHaveURL(/my-companies-page/i);
    expect(pageErrors).toEqual([]);
  });
});

test.describe('clients page browser smoke', () => {
  test('opens the clients list and add form without page errors or duplicate list fetches', async ({page}) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    const {peopleQueries} = await mockMyCompaniesApi(page);
    await page.goto('/clients-index');

    await expect(page.getByText('ACME', {exact: true})).toBeVisible({timeout: 15000});

    // Wait for list traffic to settle, then assert a single list query for clients.
    await page.waitForTimeout(1500);
    const clientListQueries = peopleQueries.filter(
      q => q.linkLinkType === 'client' || (q.query || '').includes('link.linkType=client'),
    );
    expect(clientListQueries.length).toBeGreaterThan(0);
    expect(clientListQueries.length).toBe(1);

    const addButton = page.getByRole('button', {name: 'add'});
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(
      page.getByText(/Individual|Pessoa f[ií]sica/i).first(),
    ).toBeVisible({timeout: 5000});
    expect(pageErrors).toEqual([]);
  });
});

test.describe('clients page browser smoke', () => {
  test('opens the clients list and add form without page errors', async ({page}) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await mockMyCompaniesApi(page);
    await page.goto('/clients-index');

    await expect(page.getByText('ACME', {exact: true})).toBeVisible({timeout: 15000});

    const addButton = page.getByRole('button', {name: 'add'});
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(
      page.getByText(/Individual|Pessoa f[ií]sica/i).first(),
    ).toBeVisible({timeout: 5000});
    expect(pageErrors).toEqual([]);
  });
});
