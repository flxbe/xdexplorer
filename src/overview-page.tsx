import * as React from "react";
import {
  Datenfeld,
  Datenfeldgruppe,
  Regel,
  Stammdatenschema,
} from "xdatenfelder-xml/dist/v2";
import { DataFieldType } from "./data-field-type";
import { Database, SearchResult } from "./database";
import { Link } from "react-router-dom";

type OverviewPageProps = {
  database: Database;
};

export function OverviewPage({ database }: OverviewPageProps) {
  const [term, setTerm] = React.useState<string>("");

  const searchResult = database.search(term);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-8">
          <div className="mb-3 text-center">
            <label htmlFor="searchForm" className="form-label">
              <h1>XDatenfelder Explorer</h1>
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="searchForm"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>

          <SearchResultList searchResult={searchResult} />
        </div>
      </div>
    </div>
  );
}

type Tab = "schema" | "field" | "group" | "rule";

function SearchResultList({
  searchResult,
}: {
  searchResult: SearchResult | undefined;
}) {
  const [tab, setTab] = React.useState<Tab>("schema");

  if (!searchResult) {
    return <div>Keine Ergebnisse...</div>;
  }

  function navigate(target: Tab): React.MouseEventHandler<HTMLAnchorElement> {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      setTab(target);
      event.preventDefault();
    };
  }

  let content = undefined;
  switch (tab) {
    case "field":
      content = <FieldList fields={searchResult.fields} />;
      break;
    case "group":
      content = <GroupList groups={searchResult.groups} />;
      break;
    case "rule":
      content = <RuleList rules={searchResult.rules} />;
      break;
    case "schema":
      content = <SchemaList schemas={searchResult.schemas} />;
      break;
  }

  return (
    <div>
      <ul className="nav justify-content-center mb-3">
        <li className="nav-item">
          <a href="#" className="nav-link" onClick={navigate("schema")}>
            Stammdatenschemata{" "}
            <span className="badge text-bg-secondary">
              {searchResult.schemas.length}
            </span>
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link" onClick={navigate("field")}>
            Datenfelder{" "}
            <span className="badge text-bg-secondary">
              {searchResult.fields.length}
            </span>
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link" onClick={navigate("group")}>
            Datenfeldgruppen{" "}
            <span className="badge text-bg-secondary">
              {searchResult.groups.length}
            </span>
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link" onClick={navigate("rule")}>
            Regeln{" "}
            <span className="badge text-bg-secondary">
              {searchResult.rules.length}
            </span>
          </a>
        </li>
      </ul>
      {content}
    </div>
  );
}

type FieldListProps = {
  fields: Datenfeld[];
};

function FieldList({ fields }: FieldListProps) {
  const wrappedFields = fields.slice(0, 20);

  return (
    <div className="list-group">
      {wrappedFields.map((dataField) => (
        <Link
          className="list-group-item list-group-item-action"
          to={`/datafields/${dataField.identifier}`}
          key={dataField.identifier}
        >
          <div className="row">
            <div className="col-12 col-md">
              <h6 className="mb-0">
                <span className="badge rounded-pill text-bg-secondary">
                  {dataField.identifier}
                </span>{" "}
                {dataField.name}{" "}
                <small className="text-muted">v{dataField.version}</small>
              </h6>
              <small>
                <span className="text-muted">Erstellt von</span>{" "}
                {dataField.fachlicherErsteller ?? "Unbekannt"}
              </small>
            </div>
            <div className="col-12 col-md-auto">
              <DataFieldType type={dataField.feldart} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function GroupList({ groups }: { groups: Datenfeldgruppe[] }) {
  const wrappedGroups = groups.slice(0, 20);

  return (
    <div className="list-group">
      {wrappedGroups.map((dataGroup) => (
        <div
          className="list-group-item list-group-item-action"
          key={dataGroup.identifier}
        >
          <div>
            <h6 className="mb-0">
              <span className="badge rounded-pill text-bg-secondary">
                {dataGroup.identifier}
              </span>{" "}
              {dataGroup.name}{" "}
              <small className="text-muted">v{dataGroup.version}</small>
            </h6>
            <small>
              <span className="text-muted">Erstellt von</span>{" "}
              {dataGroup.fachlicherErsteller ?? "Unbekannt"}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}

function RuleList({ rules }: { rules: Regel[] }) {
  const wrappedRules = rules.slice(0, 20);

  return (
    <div className="list-group">
      {wrappedRules.map((rule) => (
        <Link
          className="list-group-item list-group-item-action"
          to={`/rules/${rule.identifier}`}
          key={rule.identifier}
        >
          <div>
            <h6 className="mb-0">
              <span className="badge rounded-pill text-bg-secondary">
                {rule.identifier}
              </span>{" "}
              {rule.name} <small className="text-muted">v{rule.version}</small>
            </h6>
            <small>
              <span className="text-muted">Erstellt von</span>{" "}
              {rule.fachlicherErsteller ?? "Unbekannt"}
            </small>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SchemaList({ schemas }: { schemas: Stammdatenschema[] }) {
  const wrappedSchemas = schemas.slice(0, 20);

  return (
    <div className="list-group">
      {wrappedSchemas.map((schema) => (
        <div
          className="list-group-item list-group-item-action"
          key={schema.identifier}
        >
          <div>
            <h6 className="mb-0">
              <span className="badge rounded-pill text-bg-secondary">
                {schema.identifier}
              </span>{" "}
              {schema.name}{" "}
              <small className="text-muted">v{schema.version}</small>
            </h6>
            <small>
              <span className="text-muted">Erstellt von</span>{" "}
              {schema.fachlicherErsteller ?? "Unbekannt"}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
