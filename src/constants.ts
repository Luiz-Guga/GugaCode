import { OllamaModel, ProjectFile, SystemStats } from './types';

export const DEFAULT_OLLAMA_MODELS: OllamaModel[] = [
  {
    name: 'qwen2.5-coder:7b',
    size: 4700000000,
    modified_at: new Date().toISOString(),
    details: {
      format: 'gguf',
      family: 'qwen2',
      parameter_size: '7.6B',
      quantization_level: 'Q4_K_M',
    },
    description: 'Excelente para codificação geral, refatoração, TypeScript, Python e Rust.',
    isRecommended: true,
    category: 'coding',
  },
  {
    name: 'deepseek-coder-v2:16b',
    size: 8900000000,
    modified_at: new Date().toISOString(),
    details: {
      format: 'gguf',
      family: 'deepseek',
      parameter_size: '16B',
      quantization_level: 'Q4_K_M',
    },
    description: 'Modelo altamente capacitado em matemática e código de baixa e alta complexidade.',
    isRecommended: true,
    category: 'coding',
  },
  {
    name: 'llama3.2:3b',
    size: 2000000000,
    modified_at: new Date().toISOString(),
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '3.2B',
      quantization_level: 'Q4_K_M',
    },
    description: 'Super rápido para tarefas rápidas de terminal, resumos de logs e tiragem de dúvidas.',
    isRecommended: false,
    category: 'fast',
  },
  {
    name: 'codellama:7b-instruct',
    size: 3800000000,
    modified_at: new Date().toISOString(),
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '6.7B',
      quantization_level: 'Q4_K_M',
    },
    description: 'Otimizado para geração e autocompletar de código em C++, Python e Bash.',
    isRecommended: false,
    category: 'coding',
  },
  {
    name: 'mistral:7b-instruct',
    size: 4100000000,
    modified_at: new Date().toISOString(),
    details: {
      format: 'gguf',
      family: 'mistral',
      parameter_size: '7.2B',
      quantization_level: 'Q4_0',
    },
    description: 'Ótimo raciocínio lógico e instruções multilíngues incluindo Português.',
    isRecommended: false,
    category: 'general',
  },
];

export const AVAILABLE_MODELS_TO_PULL = [
  {
    name: 'qwen2.5-coder:14b',
    size: '9.0 GB',
    desc: 'O mais potente para arquitetura de software e refatoração avançada.',
  },
  {
    name: 'starcoder2:7b',
    size: '4.2 GB',
    desc: 'Especializado em 80+ linguagens com foco em segurança de código.',
  },
  {
    name: 'gemma2:9b-instruct',
    size: '5.4 GB',
    desc: 'Desenvolvido pelo Google com alta performance e respostas concisas.',
  },
  {
    name: 'phi3.5:3.8b',
    size: '2.2 GB',
    desc: 'Modelo leve da Microsoft com surpreendente raciocínio de código.',
  },
];

export const PROJECT_TEMPLATES: { [key: string]: ProjectFile } = {
  'rust-cli': {
    name: 'linux-system-tweaker',
    path: '/home/guga/projects/linux-system-tweaker',
    type: 'dir',
    children: [
      {
        name: 'Cargo.toml',
        path: '/home/guga/projects/linux-system-tweaker/Cargo.toml',
        type: 'file',
        language: 'toml',
        content: `[package]
name = "linux-system-tweaker"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
colored = "2.0"
clap = { version = "4.0", features = ["derive"] }
`,
      },
      {
        name: 'src',
        path: '/home/guga/projects/linux-system-tweaker/src',
        type: 'dir',
        children: [
          {
            name: 'main.rs',
            path: '/home/guga/projects/linux-system-tweaker/src/main.rs',
            type: 'file',
            language: 'rust',
            content: `use colored::*;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(author, version, about = "Linux Hardware & System Performance Tweaker")]
struct Args {
    /// Enable Ultra Gaming & Compute Profile
    #[arg(short, long)]
    gaming: bool,

    /// Show Real System Metrics
    #[arg(short, long)]
    status: bool,
}

fn main() {
    let args = Args::parse();

    println!("{}", "=== GugaCode Linux Tweaker ===".bold().cyan());

    if args.gaming {
        println!("[+] Aplicando perfil de alta performance...");
        println!("[+] CPU Governor configurado para: PERFORMANCE");
        println!("{}", "✔ Otimização do sistema concluída com sucesso!".green());
    } else if args.status {
        println!("Status do sistema: Ativo");
    } else {
        println!("Execute com --help para ver as opções.");
    }
}
`,
          },
        ],
      },
      {
        name: 'README.md',
        path: '/home/guga/projects/linux-system-tweaker/README.md',
        type: 'file',
        language: 'markdown',
        content: `# Linux System Tweaker CLI

Ferramenta em Rust para otimização de sistema em distribuições Linux.

## Compilação e Execução
\`\`\`bash
cargo run -- --gaming
cargo run -- --status
\`\`\`
`,
      },
    ],
  },
  'python-ai': {
    name: 'gugacode-ollama-bridge',
    path: '/home/guga/projects/gugacode-ollama-bridge',
    type: 'dir',
    children: [
      {
        name: 'main.py',
        path: '/home/guga/projects/gugacode-ollama-bridge/main.py',
        type: 'file',
        language: 'python',
        content: `import requests
import json
import sys

OLLAMA_URL = "http://localhost:11434/api/generate"

def query_ollama(prompt: str, model: str = "qwen2.5-coder:7b"):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")
    except Exception as e:
        return f"Erro ao conectar ao Ollama local: {e}"

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Escreva uma função simples em Python para ler dados do sistema."
    print("🤖 Consultando Ollama Local...")
    result = query_ollama(prompt)
    print("\n--- Resposta ---")
    print(result)
`,
      },
      {
        name: 'requirements.txt',
        path: '/home/guga/projects/gugacode-ollama-bridge/requirements.txt',
        type: 'file',
        language: 'plaintext',
        content: `requests>=2.31.0
colorama>=0.4.6
pydantic>=2.5.0
`,
      },
    ],
  },
};

export const INITIAL_SYSTEM_STATS: SystemStats = {
  osName: 'Linux Workstation',
  kernel: 'Linux Native Kernel',
  cpuModel: 'Processador Nativo do Sistema',
  cpuUsage: 5,
  ramUsedGB: 4.0,
  ramTotalGB: 16.0,
  gpuModel: 'Placa de Vídeo / Processador Gráfico Nativo',
  vramUsedGB: 1.0,
  vramTotalGB: 8.0,
  ollamaVramUsageGB: 0.5,
  activeThreads: 8,
  diskUsedGB: 20.0,
  diskTotalGB: 256.0,
  diskUsagePercent: 8,
};
