# People list — filtros de linkType e employees-index

Espelho versionado da wiki técnica:
https://github.com/ControleOnline/ui-people/wiki/People-List-LinkType-Filters-Employees-Index

Origem: app-community#760 e app-community#967.

## Encaixe

- MANAGER: `/employees-index` lista colaboradores da `currentCompany`.
- `ui-people` dono da lista (`People.js`) e de `buildPeopleLinkRequestParams`.
- `ui-customers` só monta o contexto da rota (`buildEmployeesContext`).
- `api-platform-people` lê `link.company` + `link.linkType`. Sem mudança de authZ no #967.

Não lista pessoas de outra empresa. Não substitui a aba Colaboradores do Client Details.

## Contrato de leitura

| Param | Origem |
| --- | --- |
| `link.company` | IRI `/people/{id}` da `currentCompany` |
| `link.linkType` | tipo selecionado, ou expansão de `all` |

`HUMAN_COMPANY_LINK_TYPES`: employee, owner, director, manager, salesman, after-sales, courier.

`resolveSelectedLinkTypes`:

- tipo concreto → escalar;
- `all` ou vazio → array de `availableTypes` sem a chave `all`.

## Bug da lista vazia (#967)

No caminho employees-index, `requestParams` enviava só `link.company` quando `selectedLinkType === 'all'`. A API devolvia coleção vazia. A correção usa sempre `buildPeopleLinkRequestParams` (company + linkType resolvido). Troca de `currentCompany` reconstrói `link.company`.

## Owners (#760)

`employees.js` inclui `owner` no context. O filtro do DefaultTable pode devolver string, `{value}` ou array; `handleLinkTypeFiltersChange` extrai o escalar antes de reconsultar.

## Referências

- https://github.com/ControleOnline/app-community/issues/967
- https://github.com/ControleOnline/app-community/issues/760
- https://github.com/ControleOnline/ui-customers/wiki/Client-Details-EmployeesTab-Refresh
- https://github.com/ControleOnline/app-community/wiki/ui-people
