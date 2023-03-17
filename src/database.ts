import {
  Datenfeld,
  Datenfeldgruppe,
  Regel,
  Stammdatenschema,
} from "xdatenfelder-xml/dist/v2";

export interface SearchResult {
  schemas: Stammdatenschema[];
  fields: Datenfeld[];
  groups: Datenfeldgruppe[];
  rules: Regel[];
  authors: [string, ElementRefs][];
}

interface Data {
  schemas: Record<string, Stammdatenschema>;
  fields: Record<string, Datenfeld>;
  groups: Record<string, Datenfeldgruppe>;
  rules: Record<string, Regel>;
}

export interface ElementRefs {
  schemaRefs: string[];
  fieldRefs: string[];
  groupRefs: string[];
  ruleRefs: string[];
}

interface Searchable {
  id: string;
  name: string;
}

export interface DashboardData {
  topAuthors: [string, number][];
}

export class Database {
  private data: Data;
  private authorRefs: Record<string, ElementRefs>;

  private dashboardData: DashboardData;

  constructor(data: Data) {
    this.data = data;
    this.authorRefs = collectAuthorRefs(data);
    this.dashboardData = computeDashboardData(data, this.authorRefs);
  }

  public static async fromFile(file: File): Promise<Database> {
    const content = await loadFile(file);
    const data = JSON.parse(content);

    return new Database(data);
  }

  public search(term: string): SearchResult | undefined {
    if (term === "") {
      return undefined;
    }

    return {
      schemas: searchRecord(this.data.schemas, term),
      fields: searchRecord(this.data.fields, term),
      groups: searchRecord(this.data.groups, term),
      rules: searchRecord(this.data.rules, term),
      authors: this.searchAuthors(term),
    };
  }

  private searchAuthors(term: string): [string, ElementRefs][] {
    return Object.entries(this.authorRefs).filter(([author, _refs]) =>
      author.includes(term)
    );
  }

  public getField(identifier: string): Datenfeld | undefined {
    return this.data.fields[identifier];
  }

  public getRule(identifier: string): Regel | undefined {
    return this.data.rules[identifier];
  }

  public getDashboardData(): DashboardData {
    return this.dashboardData;
  }
}

function searchRecord<T extends Searchable>(
  record: Record<string, T>,
  term: string
): T[] {
  // TODO: Make case independent
  return Object.values(record).filter(
    (item) => item.id.includes(term) || item.name.includes(term)
  );
}

async function loadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target === null) {
        return reject("Target is none");
      }
      const { result } = event.target;

      if (typeof result !== "string") {
        console.error(result);
        return reject("Unknown file content");
      }

      resolve(result);
    };

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsText(file, "utf-8");
  });
}

function collectAuthorRefs(data: Data): Record<string, ElementRefs> {
  const authorRefs: Record<string, ElementRefs> = {};

  Object.values(data.schemas).forEach((schema) => {
    const { fachlicherErsteller } = schema;
    if (fachlicherErsteller) {
      const refs = getRefForAuthor(authorRefs, fachlicherErsteller);
      refs.schemaRefs.push(schema.id);
    }
  });

  Object.values(data.fields).forEach((field) => {
    const { fachlicherErsteller } = field;
    if (fachlicherErsteller) {
      const refs = getRefForAuthor(authorRefs, fachlicherErsteller);
      refs.fieldRefs.push(field.id);
    }
  });

  Object.values(data.groups).forEach((group) => {
    const { fachlicherErsteller } = group;
    if (fachlicherErsteller) {
      const refs = getRefForAuthor(authorRefs, fachlicherErsteller);
      refs.groupRefs.push(group.id);
    }
  });

  Object.values(data.rules).forEach((rule) => {
    const { fachlicherErsteller } = rule;
    if (fachlicherErsteller) {
      const refs = getRefForAuthor(authorRefs, fachlicherErsteller);
      refs.ruleRefs.push(rule.id);
    }
  });

  return authorRefs;
}

function getRefForAuthor(
  refs: Record<string, ElementRefs>,
  author: string
): ElementRefs {
  let elementRefs = refs[author];

  if (!elementRefs) {
    elementRefs = {
      schemaRefs: [],
      fieldRefs: [],
      groupRefs: [],
      ruleRefs: [],
    };

    refs[author] = elementRefs;
  }

  return elementRefs;
}

function computeDashboardData(
  data: Data,
  authorRefs: Record<string, ElementRefs>
): DashboardData {
  const topAuthors = Object.entries(authorRefs)
    .map(countAuthorRefs)
    .sort(([_author1, count1], [_author2, count2]) => count2 - count1)
    .slice(0, 5);

  return { topAuthors };
}

function countAuthorRefs([author, refs]: [string, ElementRefs]): [
  string,
  number
] {
  const totalRefs =
    refs.fieldRefs.length +
    refs.groupRefs.length +
    refs.ruleRefs.length +
    refs.schemaRefs.length;

  return [author, totalRefs];
}
