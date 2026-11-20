import { useState, useCallback, useRef, useEffect } from 'react';

export const useFlatsMap = (flats, loading) => {
    const canvasRef = useRef(null);
    const mouseDownPos = useRef({ x: 0, y: 0 });

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredFlat, setHoveredFlat] = useState(null);

    const toScreenCoords = useCallback((x, y, width, height) => {
        const centerX = width / 2 + offset.x;
        const centerY = height / 2 + offset.y;
        return {
            screenX: centerX + x * scale,
            screenY: centerY - y * scale
        };
    }, [offset, scale]);

    const findFlatAtPosition = useCallback((mouseX, mouseY, width, height) => {
        const found = [];

        for (let i = flats.length - 1; i >= 0; i--) {
            const flat = flats[i];
            if (!flat.coordinates) continue;

            const { screenX, screenY } = toScreenCoords(flat.coordinates.x, flat.coordinates.y, width, height);
            const distance = Math.hypot(mouseX - screenX, mouseY - screenY);

            if (distance <= 20) {
                found.push(flat);
            }
        }

        return found.length > 0 ? found : null;
    }, [flats, toScreenCoords]);

    const handleResetView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleNativeWheel = (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
            setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.2), 10));
        };

        canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleNativeWheel);
        };
    }, [loading]);

    return {
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
        hoveredFlat,
        setHoveredFlat,
        toScreenCoords,
        findFlatAtPosition,
        handleResetView,
    };
};