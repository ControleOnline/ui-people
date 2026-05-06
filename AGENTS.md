## Escopo
- Modulo de pessoas e empresas.
- Cobre perfil, cadastro base, contatos, documentos, enderecos e relacionamentos entre pessoas.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.
- As listagens base de pessoas aceitam `context.context` como string unica ou array de `linkType`. Quando vier array, a tela deve exibir seletor compacto do tipo ativo e o cadastro deve perguntar qual tipo sera criado.
- O timezone do perfil deve ser lido do `user_id` autenticado quando disponivel e salvo pelo endpoint `/users/preferences`; nao usar edicao administrativa generica de `users` para preferencias do proprio login.

## Quando usar
- Prompts sobre profile, people, empresa, pessoa, enderecos, documentos, emails e vinculacoes entre pessoas.
