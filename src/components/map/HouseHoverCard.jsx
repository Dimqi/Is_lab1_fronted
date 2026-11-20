import React from 'react';
import { Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export const HouseHoverCard = ({ houses, coords }) => {
    const navigate = useNavigate();
    const list = Array.isArray(houses) ? houses : houses ? [houses] : [];

    if (list.length === 0 || !coords) return null;

    return (
        <div
            style={{
                position: 'absolute',
                top: Math.max(10, coords.y - 40),
                left: coords.x + 25,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid #334155',
                padding: '12px 16px',
                borderRadius: 8,
                color: '#fff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                width: 280,
                maxHeight: 350,
                overflowY: 'auto',
                zIndex: 10,
                pointerEvents: 'auto'
            }}
        >
            <Text strong style={{ color: '#38bdf8', fontSize: 14, display: 'block', marginBottom: 8 }}>
                {list.length > 1 ? `Найдено домов: ${list.length}` : 'Информация о доме'}
            </Text>

            {list.map((house, index) => (
                <div
                    key={house.id || index}
                    onClick={() => navigate(`/houses/${house.id}`)}
                    style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        marginBottom: index < list.length - 1 ? 6 : 0,
                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div style={{ color: '#f97316', fontWeight: 600, fontSize: 14 }}>
                        {house.name || `Дом #${house.id}`}
                    </div>
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
                        <div><b>ID:</b> {house.id}</div>
                        <div><b>Год:</b> {house.year?.toLocaleString() || '—'}</div>
                        <div><b>Этажи:</b> {house.numberOfFlatsOnFloor ?? '—'}</div>
                    </div>
                    <div style={{ color: '#38bdf8', fontSize: 11, marginTop: 4, textAlign: 'right' }}>
                        Кликнуть для перехода
                    </div>
                </div>
            ))}
        </div>
    );
};