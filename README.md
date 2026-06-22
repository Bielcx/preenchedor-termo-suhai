# Preenchedor do Instrumento de Transação — SUHAI

Ferramenta interna que preenche automaticamente os dados do segurado e do veículo no item 1
do *Instrumento Particular de Transação* da SUHAI Seguradora, eliminando o preenchimento manual
repetitivo desse documento.

## Como funciona

Tudo acontece no navegador da pessoa — não existe backend, servidor ou banco de dados.
O preenchimento do PDF é feito inteiramente no lado do cliente com [pdf-lib](https://pdf-lib.js.org/),
sobrepondo o texto digitado sobre as posições corretas do template em branco.

1. A pessoa preenche os 5 campos (Segurado, Veículo, Chassi, Placa, Apólice).
2. Ao clicar em "Gerar PDF", o template (`assets/instrumento_transacao_template.pdf`) é carregado.
3. O texto é desenhado nas coordenadas exatas das lacunas do item 1.
4. O PDF resultante é baixado direto no navegador.

Nenhum dado preenchido sai do navegador da pessoa.

## Estrutura do projeto

```
.
├── index.html      # Estrutura da página
├── css/
│   └── styles.css  # Estilos
├── js/
│   └── app.js       # Lógica de preenchimento e geração do PDF
├── vendor/
│   └── pdf-lib.min.js   # Biblioteca de manipulação de PDF (sem dependência de CDN)
└── assets/
    └── instrumento_transacao_template.pdf   # Template original, sem preenchimento
```

## Rodando localmente

Como o `app.js` usa `fetch()` para carregar o template em PDF, é necessário servir os arquivos
por HTTP — abrir o `index.html` direto no navegador (protocolo `file://`) não funciona.

Qualquer servidor estático simples resolve, por exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Deploy

Projeto 100% estático — funciona em qualquer host de arquivos estáticos (Vercel, Netlify,
GitHub Pages) sem nenhuma configuração de build.
