import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Spin, message } from 'antd';
import api from '../api/axios.js';
import { useFlatsMap } from '../hooks/useFlatsMap';
import { HouseMapHeader } from '../components/map/HouseMapHeader.jsx';
import { HouseHoverCard } from '../components/map/HouseHoverCard.jsx';
import { useWebSocket } from "../hooks/useWebSocket.js";

export const FlatsMapPage = () => {
    const navigate = useNavigate();
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cardCoords, setCardCoords] = useState(null);

    const {
        canvasRef,
        mouseDownPos,
        scale,
        setScale,
        offset,
        setOffset,
        isDragging,
        setIsDragging,
        dragStart,
        setDragStart,
        hoveredFlat: hoveredItems,
        setHoveredFlat: setHoveredItems,
        toScreenCoords,
        findFlatAtPosition,
        handleResetView,
    } = useFlatsMap(houses, loading);

    const fetchAllHouses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/house/all');
            setHouses(response.data?.content || response.data || []);
        } catch (error) {
            message.error('Не удалось загрузить данные квартир для карты');
        } finally {
            setLoading(false);
        }
    }, []);

    useWebSocket((event) => {
        const { entityType, action, id, payload } = event;

        if (entityType === 'FLAT' || entityType === 'HOUSE') {
            if (action === 'CREATE') {
                setHouses(prev => [...prev, payload]);
            } else if (action === 'UPDATE') {
                setHouses(prev => prev.map(item => item.id === Number(id) ? payload : item));
                if (hoveredItems?.some(item => item.id === Number(id))) {
                    setHoveredItems(prev => prev.map(item => item.id === Number(id) ? payload : item));
                }
            } else if (action === 'DELETE') {
                setHouses(prev => prev.filter(item => item.id !== Number(id)));
                if (hoveredItems?.some(item => item.id === Number(id))) {
                    setHoveredItems(prev => prev.filter(item => item.id !== Number(id)));
                }
            }
        }
    });

    useEffect(() => {
        fetchAllHouses();
    }, [fetchAllHouses]);

    const drawMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2 + offset.x;
        const centerY = height / 2 + offset.y;

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const gridSize = 50 * scale;

        if (gridSize > 15) {
            ctx.beginPath();
            for (let x = centerX % gridSize; x < width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, height);
            }
            for (let y = centerY % gridSize; y < height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(width, y);
            }
            ctx.stroke();
        }

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.stroke();

        const hoveredIds = new Set(hoveredItems?.map(h => h.id) || []);

        houses.forEach((flat) => {
            if (!flat.coordinates) return;
            const { screenX, screenY } = toScreenCoords(flat.coordinates.x, flat.coordinates.y, width, height);
            if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) return;

            const isHovered = hoveredIds.has(flat.id);
            ctx.save();
            ctx.translate(screenX, screenY);

            const houseSize = isHovered ? 34 : 28;
            if (isHovered) {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                ctx.beginPath();
                ctx.arc(0, -houseSize / 4, houseSize, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = isHovered ? '#ef4444' : '#f97316';
            ctx.beginPath();
            ctx.moveTo(-houseSize / 2, -houseSize / 4);
            ctx.lineTo(0, -houseSize * 0.8);
            ctx.lineTo(houseSize / 2, -houseSize / 4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = isHovered ? '#3b82f6' : '#e2e8f0';
            ctx.fillRect(-houseSize * 0.35, -houseSize / 4, houseSize * 0.7, houseSize * 0.7);

            ctx.fillStyle = '#00bfff';
            ctx.fillRect(-houseSize * 0.15, -houseSize / 8, houseSize * 0.3, houseSize * 0.4);

            ctx.fillStyle = '#000000';
            ctx.fillRect(-houseSize * 0.03, -houseSize / 8, houseSize * 0.05, houseSize * 0.4);

            ctx.fillStyle = '#000000';
            ctx.fillRect(-houseSize * 0.15, houseSize / 22, houseSize * 0.3, houseSize * 0.05);

            ctx.fillStyle = '#ffffff';
            ctx.font = isHovered ? 'bold 13px sans-serif' : '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(flat.name || `Объект #${flat.id}`, 0, houseSize * 0.75);
            ctx.restore();
        });
    }, [houses, offset, scale, hoveredItems, toScreenCoords, canvasRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updateSize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = 600;
            drawMap();
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [drawMap, canvasRef]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isDragging) {
            setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            setCardCoords(null);
        } else {
            const foundItems = findFlatAtPosition(mouseX, mouseY, canvas.width, canvas.height);
            setHoveredItems(foundItems);
            canvas.style.cursor = foundItems ? 'pointer' : 'grab';

            if (foundItems && foundItems.length > 0) {
                const firstHouse = foundItems[0];
                const { screenX, screenY } = toScreenCoords(firstHouse.coordinates.x, firstHouse.coordinates.y, canvas.width, canvas.height);
                setCardCoords({ x: screenX, y: screenY });
            } else {
                setCardCoords(null);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (canvasRef.current) {
            canvasRef.current.style.cursor = hoveredItems?.length ? 'pointer' : 'grab';
        }
    };

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const moveDistance = Math.hypot(e.clientX - mouseDownPos.current.x, e.clientY - mouseDownPos.current.y);
        if (moveDistance > 5) return;

        if (hoveredItems && hoveredItems.length === 1) {
            navigate(`/houses/${hoveredItems[0].id}`);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" tip="Загрузка координатной карты..." />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
            <HouseMapHeader
                onBack={() => navigate('/main')}
                onZoomIn={() => setScale((s) => Math.min(s * 1.2, 10))}
                onZoomOut={() => setScale((s) => Math.max(s * 0.8, 0.2))}
                onReset={handleResetView}
            />

            <Card
                bodyStyle={{ padding: 0, overflow: 'hidden', position: 'relative' }}
                style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={handleCanvasClick}
                    style={{ display: 'block', width: '100%', cursor: 'grab' }}
                />

                <HouseHoverCard houses={hoveredItems} coords={cardCoords} />
            </Card>
        </div>
    );
};