// GraphQL formatter (queries / mutations / subscriptions / SDL) and SDL schema viewer.

async function loadGraphql() {
  return await import('graphql');
}

export interface FormatResult {
  formatted: string
  warnings: string[]
  error?: string
}

export async function formatGraphql(input: string): Promise<FormatResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { formatted: '', warnings: [] };
  }
  const { parse, print } = await loadGraphql();
  try {
    // Parse as a generic Document — works for both operation documents and
    // schema definition language (SDL).
    const doc = parse(trimmed, { noLocation: true });
    return { formatted: print(doc), warnings: [] };
  }
  catch (err: any) {
    return { formatted: '', warnings: [], error: err?.message ?? String(err) };
  }
}

// SDL schema viewer
export interface FieldSummary {
  name: string
  type: string
  args: { name: string; type: string; defaultValue?: string }[]
  description?: string
}

export interface TypeSummary {
  name: string
  kind: 'Object' | 'Interface' | 'Union' | 'Enum' | 'InputObject' | 'Scalar' | 'Directive'
  description?: string
  fields: FieldSummary[]
  values?: string[] // for enums
  members?: string[] // for unions
}

export async function summarizeSdl(sdl: string): Promise<{ types: TypeSummary[]; error?: string }> {
  const trimmed = sdl.trim();
  if (!trimmed) {
    return { types: [] };
  }
  const { parse, print, Kind } = await loadGraphql();
  let doc: any;
  try {
    doc = parse(trimmed, { noLocation: true });
  }
  catch (err: any) {
    return { types: [], error: err?.message ?? String(err) };
  }

  const types: TypeSummary[] = [];

  for (const def of doc.definitions) {
    switch (def.kind) {
      case Kind.OBJECT_TYPE_DEFINITION:
      case Kind.INTERFACE_TYPE_DEFINITION:
        types.push({
          name: def.name.value,
          kind: def.kind === Kind.OBJECT_TYPE_DEFINITION ? 'Object' : 'Interface',
          description: def.description?.value,
          fields: (def.fields ?? []).map((f: any) => ({
            name: f.name.value,
            type: print(f.type),
            description: f.description?.value,
            args: (f.arguments ?? []).map((a: any) => ({
              name: a.name.value,
              type: print(a.type),
              defaultValue: a.defaultValue ? print(a.defaultValue) : undefined,
            })),
          })),
        });
        break;
      case Kind.INPUT_OBJECT_TYPE_DEFINITION:
        types.push({
          name: def.name.value,
          kind: 'InputObject',
          description: def.description?.value,
          fields: (def.fields ?? []).map((f: any) => ({
            name: f.name.value,
            type: print(f.type),
            description: f.description?.value,
            args: [],
          })),
        });
        break;
      case Kind.ENUM_TYPE_DEFINITION:
        types.push({
          name: def.name.value,
          kind: 'Enum',
          description: def.description?.value,
          fields: [],
          values: (def.values ?? []).map((v: any) => v.name.value),
        });
        break;
      case Kind.UNION_TYPE_DEFINITION:
        types.push({
          name: def.name.value,
          kind: 'Union',
          description: def.description?.value,
          fields: [],
          members: (def.types ?? []).map((t: any) => t.name.value),
        });
        break;
      case Kind.SCALAR_TYPE_DEFINITION:
        types.push({
          name: def.name.value,
          kind: 'Scalar',
          description: def.description?.value,
          fields: [],
        });
        break;
      default:
        // skip directives, operations, schema definition, etc.
        break;
    }
  }

  return { types };
}
