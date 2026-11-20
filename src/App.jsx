import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FlatDetailPage } from './pages/FlatDetailPage';
import { FlatsMapPage } from './pages/FlatsMapPage';
import { MainLayout } from "./pages/MainLayout.jsx";
import { SpecialFeaturesFlatsPage } from "./pages/SpecialFeaturesFlatsPage.jsx";
import { HouseDetailPage } from "./pages/HouseDetailPage.jsx";
import { HousesPage } from "./pages/HousesPage.jsx";
import { ImportHistoryPage } from "./pages/ImportHistoryPage.jsx";
import { useWebSocket } from "./hooks/useWebSocket.js";

function App() {
    useWebSocket();

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/main" element={<DashboardPage />} />
                            <Route path="/map" element={<FlatsMapPage />} />
                            <Route path="/flats/:id" element={<FlatDetailPage />} />
                            <Route path="/specialFeatures" element={<SpecialFeaturesFlatsPage />} />
                            <Route path="/houses/:id" element={<HouseDetailPage />} />
                            <Route path="/houses" element={<HousesPage />} />
                            <Route path="/import-history" element={<ImportHistoryPage />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Navigate to="/main" replace />} />
                    <Route path="*" element={<Navigate to="/main" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;