import { Link } from 'react-router-dom'
import LoginButton from '../LoginButton.jsx'

export default function HomePage() {
  return (
    <div style={{ padding: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Scripelle Docs</h1>
        <LoginButton />
      </header>

      {/* Replace with real list later */}
      <ul><li><Link to="/doc/123">Example Document</Link></li></ul>

      <Link to="/dashboard">Go to dashboard →</Link>
    </div>
  )
} 