import type { StoredDocument } from "../types/customTypes";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/handleHttp";
import useUserStore from "../store/userStore";
import useEditorStore from "../store/editorStore";
import DeleteConfirmationModal from "../components/Modals/DeleteConfirmationModal";
import DocumentCard from "../components/DocumentCard";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const {
    createNewDocument: createDocumentInStore,
    setDocument,
    loadDocument,
  } = useEditorStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (loading === false && documents.length === 0) {
      navigate("/");
    }
  }, [documents]);

  const handleLogout = async () => {
    navigate("/");
    await logout();
    setIsMenuOpen(false);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    const response = await auth<{ data: StoredDocument[] }>({
      method: "GET",
      url: "documents",
    });

    if (response.type === "success") {
      setDocuments(response.data?.data || []);
    }
    setLoading(false);
  };

  const createNewDocument = async () => {
    const documentId = await createDocumentInStore();

    if (documentId) {
      navigate(`/editor?id=${documentId}`);
    }
  };

  const openDocument = (docId: string) => {
    setDocument({ id: docId });
    loadDocument(docId);
    navigate(`/editor?id=${docId}`);
  };

  const handleDeleteClick = (docId: string) => {
    setDocToDelete(docId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (docToDelete) {
      const response = await auth<{ data: StoredDocument[] }>({
        method: "DELETE",
        url: `documents/${docToDelete}`,
      });

      if (response.type === "success") {
        setDocuments(documents.filter((doc) => doc.id !== docToDelete));
      }
      setDeleteModalOpen(false);
      setDocToDelete(null);
    }
  };

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > 120
      ? plainText.substring(0, 120) + "..."
      : plainText;
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    // if (diffDays < 7) return `${diffDays} days ago`;
    // if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    // if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#262626]">
      <div className="px-6 py-3 flex items-center justify-between pb-3">
        <div className="flex items-center gap-3"></div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-xl font-bold text-gray-200 font-[Yatching] italic select-none">
            Scripelle
          </h2>
        </div>

        <div className="flex items-center gap-2 relative">
          <div
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
            title={`${user?.firstName} ${user?.lastName}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {user?.firstName?.charAt(0)?.toUpperCase()}
          </div>

          {isMenuOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#333] rounded-md shadow-lg z-50"
              ref={menuRef}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-white hover:bg-[#3c3c3c] transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="my-12 mb-20">
          <div className="flex justify-center gap-4 mb-6">
            <button
              className="bg-[rgba(42,42,42,0.9)] text-[#ebe0c9] border-none rounded-full h-20 px-[45px] text-[20px] leading-none font-serif tracking-[0.2px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),_0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-shadow duration-[80ms] ease-in-out hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),_0_8px_30px_rgba(0,0,0,0.5)]"
              onClick={createNewDocument}
            >
              Start Writing
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              No documents yet
            </h3>
            <p className="text-gray-400 mb-6">
              Get started by creating your first document
            </p>
            <button
              onClick={createNewDocument}
              className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-100 text-[#262626] font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                openDocument={openDocument}
                handleDeleteClick={handleDeleteClick}
                getPreviewText={getPreviewText}
                getFormattedDate={getFormattedDate}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Dashboard;
