

# Notificacao de Novo Artigo por Email para Usuarios BarberSoft

## Objetivo
Quando um novo artigo do blog for publicado pelo admin, enviar automaticamente um email para todos os donos de empresas cadastrados na BarberSoft, notificando sobre o novo conteudo.

## Como vai funcionar

1. O admin cria/salva um novo artigo no painel de blog
2. Apos salvar, o sistema chama uma Edge Function que busca todos os emails dos usuarios cadastrados (tabela `companies` via `auth.users`)
3. A Edge Function envia um email bonito via Resend para cada usuario com o titulo, resumo e link do artigo

## Detalhes Tecnicos

### 1. Nova Edge Function: `notify-blog-post`
- Recebe: `post_id` (ou `slug`, `title`, `excerpt`, `image_url`)
- Valida que o chamador e super admin
- Busca todos os usuarios com empresa ativa na tabela `companies` (owner_user_id)
- Usa o service_role_key para listar os emails via `supabase.auth.admin.listUsers()`
- Envia email via Resend para cada usuario com template HTML estilizado (cores da BarberSoft)
- Retorna contagem de emails enviados/falhados

### 2. Integracao no Frontend (AdminBlog.tsx)
- Apos criar um novo post com sucesso no `handleSave`, chamar `supabase.functions.invoke("notify-blog-post", { body: { ... } })`
- Adicionar um botao "Notificar Usuarios" na tabela de posts existentes para reenviar manualmente
- Mostrar toast de sucesso/erro com contagem de emails enviados

### 3. Template do Email
- Header com logo BarberSoft
- Imagem do artigo (se houver)
- Titulo e resumo
- Botao "Ler Artigo Completo" linkando para `/blog/{slug}`
- Footer com link de descadastro (opt-out futuro)

### 4. Seguranca
- Apenas super admin pode acionar a funcao
- Rate limiting natural do Resend (sem spam)
- Usa `RESEND_API_KEY` ja configurado como secret

### Arquivos a criar/modificar
- **Criar**: `supabase/functions/notify-blog-post/index.ts` - Edge Function de envio
- **Modificar**: `src/pages/admin/AdminBlog.tsx` - Botao de notificacao e chamada apos criar post
- **Modificar**: `src/hooks/useBlogPosts.ts` - Callback opcional para notificacao pos-criacao

