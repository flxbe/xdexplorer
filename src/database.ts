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
}

interface Data {
  schemas: Record<string, Stammdatenschema>;
  fields: Record<string, Datenfeld>;
  groups: Record<string, Datenfeldgruppe>;
  rules: Record<string, Regel>;
}

interface Searchable {
  id: string;
  name: string;
}

export class Database {
  private data: Data;

  constructor(data: Data) {
    this.data = data;
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
    };
  }

  public getField(identifier: string): Datenfeld | undefined {
    return this.data.fields[identifier];
  }

  public getRule(identifier: string): Regel | undefined {
    return this.data.rules[identifier];
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
