export type VariableScope = 'global' | 'environment' | 'collection' | 'local';

export interface Variable {
  key: string;
  value: string;
  scope: VariableScope;
  description?: string;
  type?: 'default' | 'secret';
}

class VariablesService {
  private variables: Map<VariableScope, Map<string, Variable>> = new Map();

  constructor() {
    // Initialize maps for each scope
    this.variables.set('global', new Map());
    this.variables.set('environment', new Map());
    this.variables.set('collection', new Map());
    this.variables.set('local', new Map());
  }

  setVariable(variable: Variable): void {
    const scopeMap = this.variables.get(variable.scope);
    scopeMap?.set(variable.key, variable);
  }

  getVariable(key: string, scope?: VariableScope): Variable | undefined {
    if (scope) {
      return this.variables.get(scope)?.get(key);
    }

    // Search in order of precedence: local -> collection -> environment -> global
    const scopes: VariableScope[] = ['local', 'collection', 'environment', 'global'];
    for (const scope of scopes) {
      const value = this.variables.get(scope)?.get(key);
      if (value) return value;
    }
    return undefined;
  }

  replaceVariables(text: string): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const variable = this.getVariable(key.trim());
      return variable ? variable.value : match;
    });
  }

  getAllVariables(scope?: VariableScope): Variable[] {
    if (scope) {
      return Array.from(this.variables.get(scope)?.values() || []);
    }

    const allVariables: Variable[] = [];
    this.variables.forEach((scopeMap) => {
      allVariables.push(...Array.from(scopeMap.values()));
    });
    return allVariables;
  }

  clearScope(scope: VariableScope): void {
    this.variables.get(scope)?.clear();
  }

  clearAll(): void {
    this.variables.forEach(map => map.clear());
  }

  exportScope(scope: VariableScope): Record<string, string> {
    const exported: Record<string, string> = {};
    this.variables.get(scope)?.forEach((variable, key) => {
      exported[key] = variable.value;
    });
    return exported;
  }

  importVariables(variables: Variable[]): void {
    variables.forEach(variable => this.setVariable(variable));
  }
}

export const variablesService = new VariablesService();
export default variablesService; 