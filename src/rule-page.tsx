import * as React from "react";
import { useParams } from "react-router-dom";
import { Database } from "./database";
import { NotFoundPage } from "./not-found-page";
import { multilineToHtml } from "./util";

export interface RulePageProps {
  database: Database;
}

export function RulePage({ database }: RulePageProps) {
  let { identifier } = useParams();
  if (identifier === undefined) {
    throw new Error("identifier is undefined");
  }

  const rule = database.getRule(identifier);
  if (rule === undefined) {
    return <NotFoundPage />;
  }

  return (
    <div className="container-xxl">
      <div className="row">
        <div className="col-12 col-md-9">
          <h3>
            {rule.name} <small className="text-muted">v{rule.version}</small>
          </h3>
          <h6>
            <span className="badge rounded-pill text-bg-secondary">
              {rule.identifier}
            </span>{" "}
          </h6>
        </div>
        <div className="col-12 col-md-3 text-end">
          <button className="btn btn-sm btn-success" disabled>
            Bearbeiten
          </button>
        </div>
      </div>
      <hr />

      <dl className="row">
        <dt className="col-sm-3">Versionshinweis</dt>
        <dd className="col-sm-9">{rule.versionshinweis ?? "-"}</dd>

        <dt className="col-sm-3">Fachlicher Ersteller</dt>
        <dd className="col-sm-9">{rule.fachlicherErsteller}</dd>

        <dt className="col-sm-3">Bezug</dt>
        <dd className="col-sm-9">{multilineToHtml(rule.bezug ?? "-")}</dd>

        <dt className="col-sm-3">Definition</dt>
        <dd className="col-sm-9">{multilineToHtml(rule.definition ?? "-")}</dd>

        <dt className="col-sm-3">Beschreibung</dt>
        <dd className="col-sm-9">
          {multilineToHtml(rule.beschreibung ?? "-")}
        </dd>

        <dt className="col-sm-3">Script</dt>
        <dd className="col-sm-9">
          <div className="card">
            <div className="card-body">
              <pre className="mb-0">
                <code>{multilineToHtml(rule.script)}</code>
              </pre>
            </div>
          </div>
        </dd>
      </dl>
    </div>
  );
}
