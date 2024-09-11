import React, { useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';

const LogWindow = ({ logs }) => {
  const safeLogs = logs.length === 0 ? ["preparing..."] : logs;
  const listRef = useRef();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(safeLogs.length - 1, 'end');
    }
  }, [safeLogs]);

  const removeAnsi = (text) => {
    return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }

  // 估算每项的高度
  const getItemSize = index => {
    const lines = safeLogs[index].split('\n').length;
    const add = safeLogs[index].length / 150;
    const lineHeight = 20; // 假设每行文本高度为20px
    return (lines + add) * lineHeight; // 总高度为行数乘以行高
  };

  return (
    <List
      height={400}
      width='100%' // 设为100%使列表宽度自适应
      itemCount={safeLogs.length}
      itemSize={getItemSize}
      overscanCount={5}
      ref={listRef}
    >
      {({ index, style }) => (
        <div style={{
          ...style,
          whiteSpace: 'normal',
          wordWrap: 'break-word'
        }}>
          {removeAnsi(safeLogs[index])}
        </div>
      )}
    </List>
  );
};

export default LogWindow;
