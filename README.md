# 🚀 GugaCode - Linux Native AI Coding Assistant & IDE

**GugaCode** é um assistente de desenvolvimento alimentado por Inteligência Artificial estilo **Claude Code**, otimizado para o ecossistema **Linux** (Nobara, Fedora, Ubuntu, Debian, Arch Linux, Manjaro, Linux Mint, etc.).

O aplicativo oferece integração nativa com o **Ollama (LLMs Locais)**, suporte a APIs em nuvem (Gemini, OpenAI, Anthropic, DeepSeek, Groq, OpenRouter), visualização de métricas de hardware em tempo real e manipulação direta de arquivos do seu disco local via API Native File System.

---

## 📋 Pré-requisitos para Execução em Qualquer Distribuição Linux

Para rodar o GugaCode no seu computador Linux, você precisa de:

1. **Node.js**: Versão 18.x ou superior (Recomendado Node 20+ LTS)
2. **npm** ou **pnpm** / **yarn** / **bun**
3. **Ollama** (Opcional, mas recomendado para IA local sem custos): [https://ollama.com](https://ollama.com)
4. **Git**
5. **Navegador Moderno**: Google Chrome, Chromium, Brave, Microsoft Edge ou Opera (para suporte à *FileSystem Access API* de seleção direta de arquivos em disco).

---

## 🛠️ Passo a Passo de Instalação e Execução Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/Luiz-Guga/GugaCode.git
cd gugacode
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

### 4. Compilar e Iniciar em Modo de Produção (Deploy)
```bash
# Compila o frontend Vite e o servidor backend Express com esbuild
npm run build

# Inicia o servidor em produção
npm start
```

---

## 🤖 Configuração do Ollama para IA Local com Suporte CORS

Para que o GugaCode se conecte ao seu daemon do Ollama no Linux:

### 1. Iniciar o Serviço do Ollama com CORS Habilitado
No terminal do seu Linux, defina a variável `OLLAMA_ORIGINS` para permitir requisições do navegador:
```bash
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

*Dica para manter o Ollama ativo via systemd:*
Edite a configuração do serviço systemd do Ollama (`/etc/systemd/system/ollama.service`):
```ini
[Service]
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_HOST=0.0.0.0:11434"
```
Execute `sudo systemctl daemon-reload && sudo systemctl restart ollama`.

### 2. Baixar Modelos Recomendados para Código
```bash
# Modelo rápido e altamente eficiente para programação (7B)
ollama pull qwen2.5-coder:7b

# Modelo avançado para matemática e arquitetura (16B)
ollama pull deepseek-coder-v2:16b

# Modelo leve para respostas ultra-rápidas (3B)
ollama pull llama3.2:3b
```

---

## 💻 Recursos e Funcionalidades Nativas

### 📁 Acesso Nativo ao Armazenamento Local do Linux
- No painel **Workspace**, clique no botão verde **[Abrir Pasta Local]**.
- Selecione qualquer diretório do seu sistema de arquivos (`/home/seu-usuario/projetos`).
- Todos os arquivos serão lidos do seu disco SSD/NVMe e você poderá edita-los e salvá-los diretamente em tempo real.

### 🖥️ Monitor do Sistema em Tempo Real
- Exibe consumo real de **CPU**, frequência dos núcleos e temperatura.
- Medição precisa de **Memória RAM** e área de **Swap**.
- Leitura de espaço e estatísticas do seu **Disco SSD/NVMe**.
- Deteção automática de **GPU (NVIDIA via nvml/nvidia-smi, AMD via ROCm/amdgpu)** e consumo de VRAM em uso pelo Ollama.

### ⚡ Terminal Shell Integrado
- Execução direta de comandos da sua distribuição Linux:
  - Fedora/Nobara: `dnf search`, `dnf update`, `flatpak list`
  - Arch/Manjaro: `pacman -Sy`, `yay`
  - Ubuntu/Debian: `apt update`
  - Rust & Python: `cargo check`, `cargo run`, `python3 -m venv`
  - Ferramentas Git: `git status`, `git diff`, `git log`

---

## 📁 Estrutura do Projeto

- `server.ts`: Servidor backend Express Node.js nativo com integrações ao SO e endpoints de monitoramento.
- `src/App.tsx`: Interface principal no padrão IDE/Claude Code CLI.
- `src/components/`: Componentes modulares (Editor, Terminal, Monitor, Seletores de Modelos, Tutoriais).
- `src/services/ollamaService.ts`: Cliente de comunicação com Ollama e APIs de Nuvem.
- `src/utils/localFileSystem.ts`: Módulo de leitura e escrita direta em pastas no disco via HTML5 FileSystem API.
- `src/utils/storage.ts`: Módulo de salvamento de estado do usuário e histórico de chat no navegador.

---

## 📄 Licença

Desenvolvido para comunidade Open Source e ecossistemas Linux. Sinta-se livre para contribuir e adaptar ao seu fluxo de trabalho!
