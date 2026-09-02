/**
 * fluxo: manager-my-companies-create
 * flowchartIds: [1]
 * app-community#438 — Minhas empresas: criar PJ vinculando a pessoa autenticada.
 *
 * Justificativa flowchartIds [1]: catálogo admin não tem entry de my-companies.
 * Âncora no flowchart habilitado #1.
 *
 * Sem page.route em endpoints de produto (people, people_link, emails, phones).
 * Sessão via SMOKE_API_TOKEN quando presente; senão captura o gate de login.
 */
const fs = require('fs');
const path = require('path');
const {expect, test} = require('playwright/test');
const packageJson = require('../../../../../../../package.json');

const APP_VERSION = packageJson?.version || '1.0.0';
const FLOW_ID = 'manager-my-companies-create';
const FLOWCHART_IDS = [1];
const FLOWCHART_LINKS = FLOWCHART_IDS.map(
  id => `https://admin.controleonline.com/admin/flowcharts/${id}`,
);

const MODULES_MAX_500 = [
  path.join(__dirname, '../../../react/pages/MyCompaniesPage.js'),
  path.join(__dirname, '../../../react/components/AddCompanyModal.js'),
  path.join(__dirname, '../../../react/utils/myCompaniesCreate.js'),
];

const evidenceSteps = [];

const writeEvidence = async (page, outputDir, stepId, title) => {
  fs.mkdirSync(outputDir, {recursive: true});
  const fileName = `${stepId}.png`;
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({path: filePath, fullPage: true});
  evidenceSteps.push({
    id: stepId,
    title,
    screenshot: fileName,
    url: page.url(),
  });
  return filePath;
};

const writeManifest = outputDir => {
  const manifest = {
    fluxo: FLOW_ID,
    flowchartIds: FLOWCHART_IDS,
    flowchartLinks: FLOWCHART_LINKS,
    title: 'Minhas empresas: criar PJ sem contato PF secundário',
    issue: 'ControleOnline/app-community#438',
    appVersion: APP_VERSION,
    steps: evidenceSteps,
  };
  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outputDir, 'MANIFEST.md'),
    [
      `# ${manifest.title}`,
      '',
      `- fluxo: ${FLOW_ID}`,
      `- flowchartIds: ${JSON.stringify(FLOWCHART_IDS)}`,
      `- issue: ${manifest.issue}`,
      '',
      ...evidenceSteps.map(
        step => `- ${step.id}: ${step.title} (${step.screenshot})`,
      ),
      '',
    ].join('\n'),
  );
  return manifest;
};

const seedApiSession = async page => {
  const token = String(
    process.env.SMOKE_API_TOKEN ||
      process.env.SMOKE_ADMIN_API_TOKEN ||
      process.env.API_TOKEN ||
      '',
  ).trim();
  if (!token) return false;
  const peopleId = String(
    process.env.SMOKE_ADMIN_PEOPLE_ID || process.env.ADMIN_PEOPLE_ID || '7',
  ).trim();
  const userId = String(
    process.env.SMOKE_ADMIN_USER_ID || process.env.ADMIN_USER_ID || peopleId,
  ).trim();
  const session = {
    id: Number(userId) || userId,
    people: `/people/${peopleId}`,
    api_key: token,
    active: 1,
    mycompany: 1,
    roles: ['ROLE_SUPER'],
  };
  await page.addInitScript(
    ({session: nextSession, appVersion}) => {
      try {
        window.localStorage.setItem('session', JSON.stringify(nextSession));
        window.localStorage.setItem('config', JSON.stringify({language: 'pt-br'}));
        window.localStorage.setItem('app-type', 'MANAGER');
        window.localStorage.setItem(
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
      } catch {
        // ignore
      }
    },
    {session, appVersion: APP_VERSION},
  );
  return true;
};

test.describe('my-companies create PJ (browser smoke #438)', () => {
  test.describe.configure({timeout: 90000});

  test('My Companies modules respect 500-line limit', async () => {
    for (const file of MODULES_MAX_500) {
      expect(fs.existsSync(file), `missing ${file}`).toBe(true);
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).length;
      expect(
        lines,
        `${path.basename(file)} has ${lines} lines (max 500)`,
      ).toBeLessThanOrEqual(500);
    }
  });

  test('company-scope modal skips linked-contact block', async () => {
    const source = fs.readFileSync(MODULES_MAX_500[1], 'utf8');
    expect(source).toMatch(/autoLinkAuthenticatedPerson/);
    expect(source).toMatch(
      /isPessoaJuridica && !autoLinkAuthenticatedPerson/,
    );
  });

  test('open /my-companies-page → + → modal sem contato PF', async ({
    page,
  }, testInfo) => {
    testInfo.annotations.push({type: 'fluxo', description: FLOW_ID});
    testInfo.annotations.push({
      type: 'flowchartIds',
      description: JSON.stringify(FLOWCHART_IDS),
    });

    const outputDir = path.join(
      testInfo.outputDir,
      'manual-qa',
      'issue-438',
    );
    evidenceSteps.length = 0;

    const seeded = await seedApiSession(page);
    await page.goto('/my-companies-page');
    await writeEvidence(
      page,
      outputDir,
      '01-my-companies-entry',
      'Abrir /my-companies-page',
    );

    const loginVisible = await page
      .getByPlaceholder('Email')
      .isVisible()
      .catch(() => false);
    if (loginVisible && !seeded) {
      await writeEvidence(
        page,
        outputDir,
        '01b-login-gate',
        'Tela de login (sem SMOKE_API_TOKEN)',
      );
      writeManifest(outputDir);
      test.info().annotations.push({
        type: 'note',
        description:
          'SMOKE_API_TOKEN ausente; runner precisa credencial para ultrapassar o login',
      });
      return;
    }

    if (loginVisible && seeded) {
      await page.reload();
      await writeEvidence(
        page,
        outputDir,
        '01c-after-session-seed',
        'Reload após seed de sessão',
      );
    }

    const heading = page.getByText(/Minhas empresas|Nenhuma empresa/i).first();
    await expect(heading).toBeVisible({timeout: 25000});
    await writeEvidence(
      page,
      outputDir,
      '02-my-companies-list',
      'Lista Minhas empresas visível',
    );

    const addButton = page
      .locator(
        '[data-testid="my-companies-add"], [aria-label*="add" i], [aria-label*="plus" i]',
      )
      .first();
    if (await addButton.count()) {
      await addButton.click();
    } else {
      await page
        .locator('button, [role="button"]')
        .filter({hasText: /^\+$|^add$|novo|nova/i})
        .first()
        .click({timeout: 8000})
        .catch(async () => {
          await page.getByText('+', {exact: true}).first().click();
        });
    }

    await writeEvidence(
      page,
      outputDir,
      '03-add-company-modal',
      'Modal criar empresa aberto',
    );

    const contactBlock = page.getByText(
      /contato vinculado|first employee|nome do contato|e-mail do contato/i,
    );
    await expect(contactBlock).toHaveCount(0);

    const nameInput = page.getByPlaceholder(/nome|razão|company|empresa/i).first();
    if (await nameInput.count()) {
      await nameInput.fill('Empresa Smoke #438');
    }
    await writeEvidence(
      page,
      outputDir,
      '04-modal-without-contact',
      'Modal PJ sem bloco de contato PF',
    );

    writeManifest(outputDir);
  });
});
