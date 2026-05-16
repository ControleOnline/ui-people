## Escopo
- Modulo de pessoas e empresas.
- Cobre perfil, cadastro base, contatos, documentos, enderecos e relacionamentos entre pessoas.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.
- As listagens base de pessoas aceitam `context.context` como string unica ou array de `linkType`. Quando vier array, a tela deve exibir seletor compacto do tipo ativo e o cadastro deve perguntar qual tipo sera criado.
- O contexto `courier` deve abrir o mesmo cadastro de pessoas/funcionarios em modo de entregador, reutilizando a tela existente e apenas trocando o tipo de criacao.
- A listagem principal de pessoas em React deve usar `DefaultTable` de `ui-default`, com busca, filtros e atalhos de toolbar vindos do proprio default, sem `FlatList` ou barra de busca manual na tela.

## Quando usar
- Prompts sobre profile, people, empresa, pessoa, enderecos, documentos, emails e vinculacoes entre pessoas.
