export type TargetLang = 'typescript' | 'go' | 'rust' | 'python';

export interface ConvertInput {
  json: string
  language: TargetLang
  typeName: string
}

async function loadQuicktype() {
  return await import('quicktype-core');
}

export async function convertJsonToTypes({ json, language, typeName }: ConvertInput): Promise<string> {
  const { quicktype, InputData, jsonInputForTargetLanguage } = await loadQuicktype();

  // Validate JSON early so we can show a clean error.
  JSON.parse(json);

  const jsonInput = jsonInputForTargetLanguage(language);
  await jsonInput.addSource({ name: typeName || 'Root', samples: [json] });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const { lines } = await quicktype({
    inputData,
    lang: language,
    rendererOptions: {
      'just-types': 'true',
    },
  });

  return lines.join('\n');
}

export const languageDisplay: Record<TargetLang, { label: string; highlight: string }> = {
  typescript: { label: 'TypeScript', highlight: 'typescript' },
  go: { label: 'Go', highlight: 'go' },
  rust: { label: 'Rust', highlight: 'rust' },
  python: { label: 'Python (dataclasses)', highlight: 'python' },
};
