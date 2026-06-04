import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { NotesPage } from './pages/NotesPage'
import { NoteDetailPage } from './pages/NoteDetailPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ArchivePage } from './pages/ArchivePage'
import { CategoriesPage } from './pages/CategoriesPage'

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </Layout>
  )
}
