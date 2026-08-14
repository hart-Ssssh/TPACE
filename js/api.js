export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // Cabeçalhos de segurança (CORS) obrigatórios para navegadores web
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Responde ao "preflight" do navegador antes dele fazer o POST do login
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // =====================================================================
    // ROTAS DO APP (C# - PDV)
    // =====================================================================
    
    // Rota para o App copiar os dados do banco D1 para o banco local
    if (url.pathname === "/api/app/produtos") {
      const { results } = await env.DB.prepare("SELECT * FROM tb_produtos").all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // =====================================================================
    // ROTAS DA WEB (HTML/CSS/JS - Gerenciamento)
    // =====================================================================
    
    // Nova rota de Login para a Web
    if (url.pathname === "/api/web/login" && method === "POST") {
      try {
        // Pega o nome e senha que o HTML/JS enviou
        const body = await request.json();
        
        // Busca no banco D1 comparando nome e senha
        const stmt = env.DB.prepare("SELECT id, nome, nivel_acesso FROM tb_usuarios WHERE nome = ? AND senha = ?");
        const { results } = await stmt.bind(body.nome, body.senha).all();

        // Se achou o usuário no banco, retorna sucesso e os dados dele
        if (results.length > 0) {
          return new Response(JSON.stringify({ sucesso: true, usuario: results[0] }), { 
            status: 200, 
            headers: corsHeaders 
          });
        } else {
          // Se não achou (ou senha errada), retorna um aviso
          return new Response(JSON.stringify({ sucesso: false, erro: "Usuário ou senha incorretos!" }), { 
            status: 401, 
            headers: corsHeaders 
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({ sucesso: false, erro: "Erro no servidor." }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // Retorno padrão caso a URL acessada não exista na API
    return new Response("Rota não encontrada", { status: 404, headers: corsHeaders });
  }
};