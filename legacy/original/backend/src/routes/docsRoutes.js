import { google } from "googleapis";
import { Router } from "express";
// import { authenticateJWT } from "../middleware/middleware.js" // REMOVE THIS

const router = Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (req.user) return next();
  res.status(401).json({ error: "Unauthorized" });
}

function getDocsClient(accessToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.docs({ version: "v1", auth });
  }

// Uses req.user.access_token to authenticate with Google APIs
router.get('/all', ensureAuthenticated, async (req, res) => {
    console.log("req.user in /all:", req.user);
    const accessToken = req.user?.access_token;
    if (!accessToken) return res.status(401).json({ error: 'Unauthorized access' });

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    try {
        const response = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.document'",
            fields: 'files(id,name)',
        });
        const docs = response.data.files;
        res.json({ documents: docs });
    } catch (error) {
        console.error('Error fetching documents', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

router.get("/:id", ensureAuthenticated, async (req, res) => {
    const docId = req.params.id;
    const accessToken = req.user?.access_token;
    if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const docs = getDocsClient(accessToken);
    try {
        const response = await docs.documents.get({
            documentId: docId,
        });
        res.json({ document: response.data });
    } catch (error) {
        console.error("Error fetching doc:", error.message);
        res.status(500).json({ error: "failed to fetch document" });
    }
});

export default router;