import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const API_BASE_URL = "http://localhost:4000";

const typeClassName = {
  IMAGE: "bg-cyan-500/10 text-cyan-300",
  DOCUMENT: "bg-emerald-500/10 text-emerald-300",
  OTHER: "bg-slate-500/10 text-slate-300",
};

const getTypeLabel = (type) => {
  if (type === "IMAGE") return "Imagen";
  if (type === "DOCUMENT") return "Documento";
  return "Otro";
};

const getFileUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const Evidences = () => {
  const [operations, setOperations] = useState([]);
  const [selectedOperationId, setSelectedOperationId] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [loadingOperations, setLoadingOperations] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedOperation = useMemo(() => {
    return operations.find((operation) => operation.id === selectedOperationId);
  }, [operations, selectedOperationId]);

  const getOperations = useCallback(async () => {
    try {
      setLoadingOperations(true);
      setError("");

      const response = await api.get("/operations");
      const data = response.data.data;

      setOperations(data);

      setSelectedOperationId((currentOperationId) => {
        if (currentOperationId) return currentOperationId;
        return data.length > 0 ? data[0].id : "";
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron obtener las operaciones"
      );
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  const getAttachments = useCallback(async (operationId) => {
    if (!operationId) return;

    try {
      setLoadingAttachments(true);
      setError("");

      const response = await api.get(`/attachments/operations/${operationId}`);

      setAttachments(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "No se pudieron obtener las evidencias"
      );
    } finally {
      setLoadingAttachments(false);
    }
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedOperationId) {
      setError("Seleccioná una operación");
      return;
    }

    if (!file) {
      setError("Seleccioná un archivo para subir");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);

      await api.post(`/attachments/operations/${selectedOperationId}`, formData);

      setFile(null);
      setDescription("");
      event.currentTarget.reset();

      setSuccessMessage("Evidencia subida correctamente");
      await getAttachments(selectedOperationId);
    } catch (error) {
      setError(
        error.response?.data?.message || "No se pudo subir la evidencia"
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      getOperations();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [getOperations]);

  useEffect(() => {
    if (!selectedOperationId) return;

    const timerId = window.setTimeout(() => {
      getAttachments(selectedOperationId);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [selectedOperationId, getAttachments]);

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">Evidencias</h2>
          <p className="mt-2 text-sm text-slate-400 md:text-base">
            Subí y consultá fotos, documentos y archivos asociados a operaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => getAttachments(selectedOperationId)}
          disabled={!selectedOperationId}
          className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-60 md:w-auto"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {successMessage}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
            <h3 className="text-lg font-semibold md:text-xl">
              Seleccionar operación
            </h3>

            {loadingOperations ? (
              <p className="mt-6 text-slate-400">Cargando operaciones...</p>
            ) : operations.length === 0 ? (
              <p className="mt-6 text-slate-400">
                Todavía no hay operaciones disponibles.
              </p>
            ) : (
              <div className="mt-6">
                <label className="text-sm text-slate-300">Operación</label>
                <select
                  value={selectedOperationId}
                  onChange={(event) =>
                    setSelectedOperationId(event.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                >
                  {operations.map((operation) => (
                    <option key={operation.id} value={operation.id}>
                      {operation.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOperation && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">
                  Operación seleccionada
                </p>

                <h4 className="mt-2 wrap-break-word font-semibold text-slate-100">
                  {selectedOperation.title}
                </h4>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>
                    Estado:{" "}
                    <span className="text-slate-300">
                      {selectedOperation.status}
                    </span>
                  </p>

                  <p className="wrap-break-word">
                    Cliente:{" "}
                    <span className="text-slate-300">
                      {selectedOperation.client?.name || "Sin cliente"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          <form
            onSubmit={handleUpload}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6"
          >
            <h3 className="text-lg font-semibold md:text-xl">
              Subir evidencia
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Se permiten imágenes, PDF, Word y Excel.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-slate-300">Archivo *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Descripción</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows="4"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  placeholder="Foto del tablero antes de iniciar el trabajo."
                />
              </div>
            </div>

            <button
              disabled={uploading || !selectedOperationId}
              className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {uploading ? "Subiendo..." : "Subir evidencia"}
            </button>
          </form>
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold md:text-xl">
              Archivos asociados
            </h3>

            <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {attachments.length} evidencias
            </span>
          </div>

          {loadingAttachments ? (
            <p className="mt-6 text-slate-400">Cargando evidencias...</p>
          ) : attachments.length === 0 ? (
            <p className="mt-6 text-slate-400">
              Esta operación todavía no tiene evidencias cargadas.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {attachments.map((attachment) => (
                <article
                  key={attachment.id}
                  className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        typeClassName[attachment.type] ||
                        "bg-slate-500/10 text-slate-300"
                      }`}
                    >
                      {getTypeLabel(attachment.type)}
                    </span>

                    <span className="text-xs text-slate-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  {attachment.type === "IMAGE" && (
                    <a
                      href={getFileUrl(attachment.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block overflow-hidden rounded-lg border border-slate-800 bg-slate-900"
                    >
                      <img
                        src={getFileUrl(attachment.url)}
                        alt={attachment.originalName}
                        className="h-48 w-full object-cover md:h-44"
                      />
                    </a>
                  )}

                  <h4 className="mt-4 wrap-break-word font-semibold text-slate-100">
                    {attachment.originalName}
                  </h4>

                  <p className="mt-2 wrap-break-word text-sm text-slate-400">
                    {attachment.description || "Sin descripción"}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <p className="wrap-break-word">
                      Subido por:{" "}
                      <span className="text-slate-300">
                        {attachment.uploadedBy?.name || "-"}
                      </span>
                    </p>

                    <p>
                      Fecha:{" "}
                      <span className="text-slate-300">
                        {new Date(attachment.createdAt).toLocaleString()}
                      </span>
                    </p>

                    <p className="break-all">
                      MIME:{" "}
                      <span className="text-slate-300">
                        {attachment.mimeType}
                      </span>
                    </p>
                  </div>

                  <a
                    href={getFileUrl(attachment.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-cyan-500 hover:text-slate-950 sm:w-auto"
                  >
                    Abrir archivo
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Evidences;