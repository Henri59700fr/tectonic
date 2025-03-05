import React from 'react';

interface CellValue {
  mainValue?: number;
  smallValues: Set<number>;
  isKey?: boolean;
}

interface GridProps {
  rows: number;
  cols: number;
  walls: Set<string>;
  onWallToggle: (wallId: string) => void;
  cellValues: Record<string, CellValue>;
  onCellClick: (cellId: string) => void;
  selectedSmallNumber: number | null;
}

export function Grid({ rows, cols, walls, onWallToggle, cellValues, onCellClick, selectedSmallNumber }: GridProps) {
  const cellSize = 50; // px
  const wallThickness = 3; // px
  
  const gridWidth = cols * cellSize + wallThickness;
  const gridHeight = rows * cellSize + wallThickness;

  const getWallId = (i: number, j: number, isHorizontal: boolean) => 
    `${i}-${j}-${isHorizontal ? 'h' : 'v'}`;

  const getCellId = (i: number, j: number) => `${i}-${j}`;

  const getValuePosition = (value: number) => {
    switch (value) {
      case 1: return 'top-1 left-1';
      case 2: return 'top-1 right-1';
      case 3: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 4: return 'bottom-1 left-1';
      case 5: return 'bottom-1 right-1';
      default: return '';
    }
  };

  return (
    <div
      className="relative bg-gray-100"
      style={{
        width: gridWidth,
        height: gridHeight,
        border: `${wallThickness}px solid black`,
      }}
    >
      {/* Grid cells */}
      {Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => {
          const cellId = getCellId(i, j);
          const cellValue = cellValues[cellId];
          return (
            <div
              key={`cell-${i}-${j}`}
              className="absolute cursor-pointer"
              style={{
                left: j * cellSize + wallThickness,
                top: i * cellSize + wallThickness,
                width: cellSize - wallThickness,
                height: cellSize - wallThickness,
                border: '1px solid #666',
              }}
              onClick={() => onCellClick(cellId)}
            >
              {cellValue?.mainValue && (
                <span className={`absolute text-xl text-center w-full h-full flex items-center justify-center ${cellValue.isKey ? 'font-bold' : 'font-normal'}`}>
                  {cellValue.mainValue}
                </span>
              )}
              {cellValue?.smallValues && Array.from(cellValue.smallValues).map(value => (
                <span
                  key={value}
                  className={`absolute text-xs font-medium ${getValuePosition(
                    value
                  )}`}
                  style={{
                    backgroundColor:
                      selectedSmallNumber === value ? 'lightgreen' : 'transparent',
                  }}
                >
                  {value}
                </span>
              ))}
            </div>
          );
        })
      )}

      {/* Vertical walls */}
      {Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols + 1 }, (_, j) => {
          const wallId = getWallId(i, j, false);
          return (
            <div
              key={wallId}
              className="absolute cursor-pointer hover:bg-blue-200"
              style={{
                left: j * cellSize,
                top: i * cellSize,
                width: wallThickness,
                height: cellSize,
                backgroundColor: walls.has(wallId) ? 'black' : 'transparent',
              }}
              onClick={() => onWallToggle(wallId)}
            />
          );
        })
      )}

      {/* Horizontal walls */}
      {Array.from({ length: rows + 1 }, (_, i) =>
        Array.from({ length: cols }, (_, j) => {
          const wallId = getWallId(i, j, true);
          return (
            <div
              key={wallId}
              className="absolute cursor-pointer hover:bg-blue-200"
              style={{
                left: j * cellSize,
                top: i * cellSize,
                width: cellSize,
                height: wallThickness,
                backgroundColor: walls.has(wallId) ? 'black' : 'transparent',
              }}
              onClick={() => onWallToggle(wallId)}
            />
          );
        })
      )}
    </div>
  );
}