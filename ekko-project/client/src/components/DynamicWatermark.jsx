import React, { useEffect, useState } from 'react';

/**
 * 动态水印组件 - 防止录屏盗版
 * 
 * 特性：
 * 1. 显示用户手机号/邮箱
 * 2. 随机位置浮动
 * 3. 半透明显示
 * 4. 防止被 CSS 隐藏
 */
const DynamicWatermark = ({ user }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    // 每 3-5 秒随机移动水印位置
    const moveWatermark = () => {
      const randomX = Math.random() * 80 + 10; // 10% - 90%
      const randomY = Math.random() * 80 + 10; // 10% - 90%
      const randomOpacity = Math.random() * 0.2 + 0.2; // 0.2 - 0.4
      
      setPosition({ x: randomX, y: randomY });
      setOpacity(randomOpacity);
    };

    // 初始随机位置
    moveWatermark();

    // 定期移动
    const interval = setInterval(moveWatermark, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  // 显示信息：优先手机号，其次邮箱
  const displayText = user.phone || user.email || user.name;

  return (
    <>
      {/* 主水印 */}
      <div
        style={{
          position: 'fixed',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: opacity,
          transition: 'all 2s ease-in-out',
          userSelect: 'none',
          fontSize: '14px',
          color: '#ffffff',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          mixBlendMode: 'difference',
        }}
      >
        {displayText}
      </div>

      {/* 备用水印（防止主水印被遮挡） */}
      <div
        style={{
          position: 'fixed',
          left: `${100 - position.x}%`,
          top: `${100 - position.y}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: opacity * 0.5,
          transition: 'all 2s ease-in-out',
          userSelect: 'none',
          fontSize: '12px',
          color: '#ffffff',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
          mixBlendMode: 'difference',
        }}
      >
        {displayText}
      </div>

      {/* 角落固定水印 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          pointerEvents: 'none',
          zIndex: 9997,
          opacity: 0.15,
          userSelect: 'none',
          fontSize: '10px',
          color: '#ffffff',
          textShadow: '0 0 2px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {displayText} · {new Date().toLocaleDateString('zh-CN')}
      </div>
    </>
  );
};

export default DynamicWatermark;
