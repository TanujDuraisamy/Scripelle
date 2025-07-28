import React, { useEffect, useState } from "react";

// Helper to extract plain text from Google Docs API's body.content
function extractPlainTextFromGoogleDoc(contentArray) {
  if (!Array.isArray(contentArray)) return "";
  let text = "";
  for (const element of contentArray) {
    if (element.paragraph && Array.isArray(element.paragraph.elements)) {
      for (const el of element.paragraph.elements) {
        if (el.textRun && el.textRun.content) {
          text += el.textRun.content;
        }
      }
      text += "\n"; // Paragraph break
    }
  }
  return text.trim();
}

const GoogleDocsList = React.memo(({ onDocImported }) => {
  console.log("GoogleDocsList rendering"); // Debug log to track re-renders
  
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:3000/api/v1/docs/all", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch docs list: " + res.status);
        return res.json();
      })
      .then(data => {
        setDocs(data.documents || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load Google Docs. Are you signed in? (" + err.message + ")");
        setLoading(false);
      });
  }, []);

  const handleDocClick = (docId) => {
    setSelectedDocId(docId);
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3000/api/v1/docs/${docId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch doc content: " + res.status);
        return res.json();
      })
      .then(data => {
        setLoading(false);
        if (onDocImported) {
          const plainText = extractPlainTextFromGoogleDoc(data.document.body?.content || []);
          onDocImported(plainText, data.document);
        }
      })
      .catch((err) => {
        setError("Failed to load document content. (" + err.message + ")");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Import from Google Docs</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && docs.length === 0 && (
        <div>No Google Docs found or you are not authorized.</div>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {docs.map((doc) => (
          <li key={doc.id} style={{ marginBottom: 8 }}>
            <button
              style={{
                padding: "8px 16px",
                background: selectedDocId === doc.id ? "#e0e7ff" : "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
              onClick={() => handleDocClick(doc.id)}
              disabled={loading}
            >
              {doc.name || doc.title || "Untitled"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

GoogleDocsList.displayName = 'GoogleDocsList';

export default GoogleDocsList; 