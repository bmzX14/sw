import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import PostForm from "./pages/PostForm";
import PostDetail from "./pages/PostDetail";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Main Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/messages" element={<Chat />} />

        {/* Post Form - support multiple paths */}
        <Route path="/post-form" element={<PostForm />} />
        <Route path="/postform" element={<PostForm />} />
        <Route path="/posts/new" element={<PostForm />} />

        {/* Post Detail - support multiple paths */}
        <Route path="/post-detail/:id" element={<PostDetail />} />
        <Route path="/postdetail/:id" element={<PostDetail />} />
        <Route path="/posts/:id" element={<PostDetail />} />

        {/* Unknown path */}
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;