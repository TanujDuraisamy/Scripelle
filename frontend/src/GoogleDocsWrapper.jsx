import React, { useEffect, useState, useMemo, useCallback } from "react";
import LoginButton from "./LoginButton";
import GoogleDocsList from "./GoogleDocsList";
import AppEditor from "./app"; // Import the main editor component

const GoogleDocsWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [importedDoc, setImportedDoc] = useState(() => {
    const saved = sessionStorage.getItem('importedDoc');
    return saved ? JSON.parse(saved) : null;
  }); // For Google Docs import
  // Show modal only if it hasn't been shown this session
  const modalShown = useMemo(() => sessionStorage.getItem('modalShown') === 'true', []);
  const [showModal, setShowModal] = useState(() => !modalShown);
  const [modalShownState, setModalShownState] = useState(modalShown);

  // Track previous login state
  const [prevLoggedIn, setPrevLoggedIn] = useState(null);

  // Memoize the onDocImported callback to prevent unnecessary re-renders
  const handleDocImported = useCallback((plainText, fullDoc) => {
    console.log("onDocImported called", { plainText, fullDoc });
    const docObj = { plainText, fullDoc };
    setImportedDoc(docObj);
    sessionStorage.setItem('importedDoc', JSON.stringify(docObj));
    setShowModal(false);
  }, []);

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log("GoogleDocsWrapper mounted");
    return () => {
      console.log("GoogleDocsWrapper unmounted");
    };
  }, []);

  // Debug: Track importedDoc changes
  useEffect(() => {
    console.log("importedDoc changed:", importedDoc);
  }, [importedDoc]);

  useEffect(() => {
    // TEMP: Add 500ms delay before checking /me to allow session to establish
    setTimeout(() => {
      fetch("http://localhost:3000/api/v1/auth/me?ts=" + Date.now(), { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Not logged in");
        })
        .then(data => {
          console.log("/me response:", data);
          if (data && data.user) {
            setIsLoggedIn(true);
            console.log("Set isLoggedIn to true");
          } else {
            setIsLoggedIn(false);
            console.log("Set isLoggedIn to false");
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
          console.log("Set isLoggedIn to false (catch)");
        });
    }, 500); // 500ms delay
  }, []);

  // Show modal every time user logs in
  useEffect(() => {
    //temp: log login state transitions
    console.log("//temp isLoggedIn:", isLoggedIn, "prevLoggedIn:", prevLoggedIn);
    if (isLoggedIn && !prevLoggedIn && !modalShownState) {
      setShowModal(true);
      setModalShownState(true);
      sessionStorage.setItem('modalShown', 'true');
      console.log("//temp Modal should be visible!");
    }
    setPrevLoggedIn(isLoggedIn);
  }, [isLoggedIn, modalShownState]);

  const handleLogout = () => {
    fetch("/api/v1/auth/logout", { credentials: "include" })
      .then(() => {
        setIsLoggedIn(false);
        setImportedDoc(null);
        setShowModal(false);
        setModalShownState(false);
        sessionStorage.removeItem('modalShown');
        sessionStorage.removeItem('importedDoc');
      });
  };

  // Only render UI after login state is resolved
  if (isLoggedIn === null) {
    return <div>Checking login status...</div>;
  }
  if (!isLoggedIn) {
    return <LoginButton />;
  }

  console.log("Render: showModal", showModal, "importedDoc", importedDoc, "isLoggedIn", isLoggedIn);

  // Show modal after login for import options
  if (showModal) {
    //temp: log when modal is rendered
    console.log("//temp Rendering modal!");
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, textAlign: 'center', border: '3px solid red' }}>
          <h2>Welcome to Scripelle! (//temp modal)</h2>
          <p>How would you like to get started?</p>
          <button style={{ margin: 8 }} onClick={() => setShowModal(false)}>Continue to Editor</button>
          <button style={{ margin: 8 }} onClick={() => setShowModal(false)}>Import from Google Docs</button>
          <button style={{ margin: 8 }} onClick={() => { setShowModal(false); /* TODO: handle local import */ }}>Import from Device</button>
          <div style={{ marginTop: 24 }}>
            <button onClick={handleLogout} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  // Show logout button after login
  return (
    <div>
      <button onClick={handleLogout} style={{ float: 'right', margin: 8, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
      {!importedDoc ? (
        <GoogleDocsList onDocImported={handleDocImported} />
      ) : (
        <div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Imported Document: {importedDoc.fullDoc?.title || 'Untitled'}</h2>
            <div 
              style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                textAlign: 'left',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
              dangerouslySetInnerHTML={{ 
                __html: importedDoc.plainText
                  .split(/\n+/)
                  .map(line => line.trim())
                  .map(line => (line ? `<p>${line}</p>` : '<br>'))
                  .join('')
              }}
            />
            <button 
              onClick={() => {
                setImportedDoc(null);
                sessionStorage.removeItem('importedDoc');
              }}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Google Docs List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDocsWrapper;
