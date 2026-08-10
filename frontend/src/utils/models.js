export const MODELS = [
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B',
    vendor: 'OpenAI',
    description: 'Fast open-weight reasoning model.',
    accent: '#10a37f',
  },
  {
    id: 'nemotron-3-super',
    name: 'Nemotron 3 Super',
    vendor: 'NVIDIA',
    description: 'Powerful reasoning and long-context model.',
    accent: '#76b900',
  },
  {
    id: 'gemma-4-26b',
    name: 'Gemma 4 26B A4B',
    vendor: 'Google',
    description: 'Efficient multimodal reasoning model.',
    accent: '#4285f4',
  },
  {
    id: 'nemotron-3-nano',
    name: 'Nemotron 3 Nano 30B',
    vendor: 'NVIDIA',
    description: 'Fast and efficient reasoning model.',
    accent: '#76b900',
  },
];

export const JUDGE_MODELS = [
  {
    id: 'nemotron-3-ultra',
    name: 'Nemotron 3 Ultra',
    vendor: 'NVIDIA',
    description: 'Strong reasoning judge.',
    accent: '#76b900',
  },
];

export function getModel(id) {
  return [...MODELS, ...JUDGE_MODELS].find(
    (m) => m.id === id || m.name === id
  );
}