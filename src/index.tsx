import * as React from "react";
import { createRoot } from "react-dom/client";
import { Routes, Route, HashRouter, Link } from "react-router-dom";
import { Database } from "./database";
import { NotFoundPage } from "./not-found-page";
import { OverviewPage } from "./overview-page";
import { DataFieldPage } from "./data-field-page";
import { RulePage } from "./rule-page";

function Application() {
  const [database, setDatabase] = React.useState<Database | null>(null);

  function renderContent() {
    if (database !== null) {
      return <Explorer database={database} />;
    } else {
      return <UploadPage onUpload={setDatabase} />;
    }
  }

  return (
    <div>
      <nav className="navbar bg-dark" data-bs-theme="dark">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand mb-0 h1">
            xDatenfelder Explorer
          </Link>
        </div>
      </nav>
      {renderContent()}
    </div>
  );
}

interface UploadPageProps {
  onUpload: (database: Database) => void;
}

interface ParserError {
  type: "error";
  message: string;
}

interface Ready {
  type: "ready";
}

interface Loading {
  type: "loading";
}

type UploadState = ParserError | Ready | Loading;

function UploadPage({ onUpload }: UploadPageProps) {
  const [state, setState] = React.useState<UploadState>({ type: "ready" });

  const isLoading = state.type === "loading";

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;
    if (files === null || files.length === 0) {
      return;
    }

    setState({ type: "loading" });

    try {
      const database = await Database.fromFile(files[0]);
      onUpload(database);
    } catch (error: any) {
      console.error(error);
      setState({ type: "error", message: `${error}` });
    }
  }

  function renderProgress() {
    if (state.type !== "loading") {
      return undefined;
    }

    return (
      <div
        className="mt-3 mb-0 alert alert-info d-flex align-items-center"
        role="alert"
      >
        <div>Datei wird geladen...</div>
      </div>
    );
  }

  function renderError() {
    if (state.type !== "error") {
      return undefined;
    }

    const message = state.message;

    return (
      <div
        className="mt-3 mb-0 alert alert-danger d-flex align-items-center"
        role="alert"
      >
        <div>{message}</div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-3">Datenbank öffnen</h4>
              <input
                className="form-control"
                type="file"
                accept=".json"
                disabled={isLoading}
                onChange={onChange}
              />
              {renderProgress()}
              {renderError()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ViewerProps = {
  database: Database;
};

function Explorer({ database }: ViewerProps) {
  return (
    <div className="container py-5">
      <Routes>
        <Route path="/" element={<OverviewPage database={database} />}></Route>
        <Route path="*" element={<NotFoundPage />} />
        <Route
          path="/datafields/:identifier"
          element={<DataFieldPage database={database} />}
        ></Route>
        <Route
          path="/rules/:identifier"
          element={<RulePage database={database} />}
        ></Route>
      </Routes>
    </div>
  );
}

function Root() {
  return (
    <React.StrictMode>
      <HashRouter>
        <Application />
      </HashRouter>
    </React.StrictMode>
  );
}

const element = document.getElementById("root");
if (element === null) {
  throw Error("Cannot find #root element");
}

const root = createRoot(element);
root.render(<Root />);
