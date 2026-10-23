# 🎵 Music 101

Um player de música moderno, rápido e responsivo, desenvolvido para ser hospedado gratuitamente no **GitHub Pages** (ou em qualquer servidor estático).

Modelado a partir do projeto [reading](https://github.com/dannielcristie/reading): mesma ideia de coleção pessoal com tela de senha, busca instantânea, navegação por álbuns e catálogo gerado automaticamente. A diferença é que aqui você ouve as músicas direto no navegador, com player fixo, fila, aleatório, repetição e retomada de onde parou.

**🌐 Demo:** https://danniel.com.br/music-101/

---

## ✨ Recursos

- 🎧 **Player completo**: play/pause, anterior/próxima, barra de progresso, volume, mudo, aleatório e repetição (álbum ou faixa).
- 💿 **Álbuns e pastas**: músicas soltas na raiz aparecem em "Geral"; cada subpasta vira um álbum, com tela dedicada e *breadcrumbs*.
- 🔍 **Busca em tempo real**: procure por título, artista, álbum ou nome do arquivo.
- 🎼 **Metadados ID3**: título, artista, álbum e duração são lidos automaticamente do arquivo (via `mutagen`).
- 💾 **Memória de reprodução**: salva volume, aleatório, repetição, última música e posição no `localStorage`.
- ⌨️ **Atalhos de teclado**: `Espaço` toca/pausa, `←/→` avança/volta 5s, `↑/↓` ajusta o volume, `N/P` próxima/anterior.
- 📱 **Media Session**: controles na tela de bloqueio e nos fones (quando suportado).
- 🔒 **Acesso protegido por senha**: autenticação com hash SHA-256 e fallback em JavaScript puro.
- ⚡ **Sincronização automática**: script Python + GitHub Actions atualizam o catálogo sempre que uma música é adicionada.
- 🌐 **Pronto para GitHub Pages**: `.nojekyll`, caminhos codificados e layout responsivo.

---

## 📂 Estrutura do Projeto

```text
music-101/
├── .github/
│   └── workflows/
│       └── update-musicas.yml  # Gera lista_musicas.json automaticamente
├── .nojekyll                   # Desativa o processamento Jekyll no GitHub Pages
├── generate_list.py            # Varre o projeto, lê ID3 e gera o catálogo
├── index.html                  # Estrutura da aplicação
├── lista_musicas.json          # Catálogo gerado automaticamente
├── script.js                   # Autenticação, navegação e player
├── style.css                   # Tema escuro e layout responsivo
└── README.md
```

---

## 🎵 Como Adicionar Músicas

Você pode colocar os arquivos de duas formas:

```text
music-101/
├── minha-musica.mp3            # aparece em "Geral"
├── outra-musica.flac           # aparece em "Geral"
└── Nome do Álbum/              # vira um álbum
    ├── 01 - Faixa.mp3
    └── 02 - Faixa.mp3
```

Formatos suportados: `.mp3`, `.m4a`, `.aac`, `.ogg`, `.oga`, `.opus`, `.wav`, `.flac`, `.webm`, `.wma`, `.aiff` e `.aif`.

Depois de adicionar os arquivos:

```bash
python3 generate_list.py
git add .
git commit -m "feat: adicionar músicas"
git push origin main
```

> 💡 Se você enviar as músicas diretamente pela interface do GitHub, o **GitHub Actions** atualiza o `lista_musicas.json` automaticamente em poucos segundos.

Para ler os metadados ID3 localmente, instale o `mutagen`:

```bash
pip install mutagen
```

---

## 🔑 Como Alterar a Senha de Acesso

A senha é verificada comparando o hash **SHA-256** no arquivo `script.js`. O hash atual é o mesmo do projeto `reading`.

1. Gere o hash da sua nova senha:

   ```bash
   echo -n "sua-nova-senha" | sha256sum
   ```

2. Abra o `script.js` e substitua o valor de `PASSWORD_HASH`:

   ```javascript
   const PASSWORD_HASH = 'seu_hash_gerado_aqui';
   ```

---

## 🌐 GitHub Pages

1. No repositório, vá em **Settings** > **Pages**.
2. Em **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` e pasta `/ (root)`
3. Em **Settings** > **Actions** > **General**:
   - Em **Workflow permissions**, selecione **Read and write permissions**.

O site ficará disponível em `https://danniel.com.br/music-101/` (ou em `https://SEU-USUARIO.github.io/music-101/`, que redireciona para o domínio personalizado da conta, se houver).

---

## 🧪 Rodando Localmente

Como é um site estático, basta servir a pasta:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

> ⚠️ O `http.server` do Python **não suporta requisições Range**, então a barra de progresso pode não conseguir pular para outra posição localmente. No GitHub Pages (ou usando `npx serve .`) o *seek* funciona normalmente.

> A tela de senha usa Web Crypto com fallback em JS, então funciona tanto em `http://localhost` quanto em `https://`.

---

## 📄 Licença

Projeto pessoal para uso próprio. As músicas adicionadas são de responsabilidade de quem as envia.
