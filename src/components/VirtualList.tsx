import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualList<T>({ 
  items, 
  renderItem, 
  estimateSize = 200 
}: { 
  items: T[]; 
  renderItem: (item: T, index: number) => React.ReactNode; 
  estimateSize?: number; 
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef} 
      className="scroll-container" 
      style={{
        maxHeight: '70vh', // Or specific height so it can scroll
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              paddingBottom: '24px', // gap
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
