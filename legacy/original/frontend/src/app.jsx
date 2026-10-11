import { Routes, Route, Navigate } from 'react-router-dom'
import EditorPage from './editor/Editor.jsx'
import HomePage   from './pages/HomePage/HomePage.jsx'
import Dashboard  from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<HomePage   />} />
      <Route path="/dashboard"  element={<Dashboard  />} />
      <Route path="/doc/:id"    element={<EditorPage />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}
