import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { Grid } from './components/Grid';
import { GridSizeSelector } from './components/GridSizeSelector';
import { Undo2, Printer, RotateCcw, Lock, Unlock, Power } from 'lucide-react';

interface CellValue {
  mainValue?: number;
  smallValues: Set<number>;
  isKey?: boolean;
}

interface GameState {
  cellValues: Record<string, CellValue>;
  walls: Set<string>;
  lastAction?: {
    type: 'addNumber' | 'removeNumber' | 'toggleWall';
    cellId?: string;
    wallId?: string;
    number?: number;
  };
}

function App() {
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 });
  const [walls, setWalls] = useState<Set<string>>(new Set());
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedSmallNumber, setSelectedSmallNumber] = useState<number | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, CellValue>>({});
  const [history, setHistory] = useState<GameState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingKeys, setIsSettingKeys] = useState(true);

  const saveState = useCallback((lastAction?: GameState['lastAction']) => {
      // Only save state if we're in unlock mode
      if (isLocked) return;
  
      const newState: GameState = {
        cellValues: JSON.parse(JSON.stringify(cellValues, (key, value) => {
          if (value instanceof Set) return Array.from(value);
          return value;
        })),
        walls: new Set(walls),
        lastAction: lastAction,
      };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [cellValues, walls, currentIndex, isLocked]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setCellValues(
        JSON.parse(JSON.stringify(previousState.cellValues), (key, value) => {
          if (Array.isArray(value)) return new Set(value);
          return value;
        })
      );
      setWalls(new Set(previousState.walls));
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, history]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  }, [undo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleWallToggle = useCallback((wallId: string) => {
    if (isLocked) return;
    setWalls(prev => {
      const newWalls = new Set(prev);
      if (newWalls.has(wallId)) {
        newWalls.delete(wallId);
      } else {
        newWalls.add(wallId);
      }
      return newWalls;
    });
    saveState();
  }, [saveState, isLocked]);

  const handleCellClick = useCallback((cellId: string) => {
    if (isLocked && cellValues[cellId]?.isKey) return; // Prevent modifying key numbers when locked
    
    if (selectedNumber !== null) {
      setCellValues(prev => {
        const newValues = { ...prev };
        const currentValue = newValues[cellId] || { smallValues: new Set() };
        
        if (currentValue?.mainValue === selectedNumber) {
          delete newValues[cellId];
        } else {
          newValues[cellId] = {
            mainValue: selectedNumber,
            smallValues: new Set(),
            isKey: !isLocked && isSettingKeys,
          };
        }
        
        return newValues;
      });
      
      // Only save state if we're in unlock mode
      if (!isLocked) {
        saveState();
      }
    } else if (selectedSmallNumber !== null && (!isSettingKeys || isLocked)) {
      setCellValues(prev => {
        const newValues = { ...prev };
        const currentValue = newValues[cellId] || { smallValues: new Set() };
        if (currentValue.isKey) return newValues; // Don't modify key numbers

        const newSmallValues = new Set(currentValue.smallValues);

        if (newSmallValues.has(selectedSmallNumber)) {
          newSmallValues.delete(selectedSmallNumber);
        } else {
          newSmallValues.add(selectedSmallNumber);
        }

        if (newSmallValues.size === 0 && !currentValue.mainValue) {
          delete newValues[cellId];
        } else {
          newValues[cellId] = {
            ...currentValue,
            smallValues: newSmallValues
          };
        }

        return newValues;
      });

      // Only save state if we're in unlock mode
      if (!isLocked) {
        saveState({
          type: 'addNumber',
          cellId: cellId,
          number: selectedSmallNumber,
        });
      }
    }
  }, [selectedNumber, selectedSmallNumber, saveState, isLocked, isSettingKeys]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
      if (!window.confirm("Are you sure you want to reset the grid?")) {
        return;
      }
      // Clear only non-key numbers when resetting
      setCellValues(prev => {
        const newValues: Record<string, CellValue> = {};
        Object.entries(prev).forEach(([key, value]) => {
          if (value.isKey) {
            newValues[key] = value;
          }
        });
        
        Object.keys(prev).forEach(key => {
          if (!newValues[key]) {
            delete prev[key];
          }
        });
        
        return { ...prev };
      });
      
      saveState();
    }, [saveState]);

  const handleStop = useCallback(() => {
    if (!window.confirm("Are you sure you want to stop the game? All progress will be lost.")) {
      return;
    }
    setIsLocked(false);
    setIsSettingKeys(true);
    setCellValues({});
    setWalls(new Set());
    saveState();
  }, [saveState]);

  const handleLock = useCallback(() => {
    setIsLocked(prev => !prev);
    setIsSettingKeys(false);
  }, []);

  useEffect(() => {
    // Initialize history with empty state
    saveState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  
    
      const renderNumberButtons = () => (
        <div className="flex gap-4 justify-center">
          {[1, 2, 3, 4, 5].map(number => {
            const isSelected = selectedNumber === number;
            return (
              <div key={number} className="flex items-center">
                <button
                  className={`rounded-md font-semibold transition-colors border-2 border-gray-600 mb-3 w-13 h-13 text-xl ${
                                      isSelected ? 'bg-blue-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                  style={{ marginBottom: '0.75rem' }}
                  onClick={() => {
                    setSelectedNumber(isSelected ? null : number);
                    setSelectedSmallNumber(null);
                  }}
                >
                  {number}
                </button>
                <button
                  className={`rounded-md font-semibold transition-colors border-2 border-gray-600 w-8 h-8 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200`}
                  disabled={!isLocked && isSettingKeys}
                  style={{ marginLeft: '10px', position: 'relative', top: '-25px' }}
                >
                  {number}
                </button>
              </div>
            );
          })}
        </div>
      );
    
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <header className="bg-white shadow-md print:shadow-none">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex flex-col items-center mb-4">
                <h1 className="text-4xl font-bold text-gray-800 text-center">TECTONIC GRID</h1>
              </div>
              
              <div className="flex items-center justify-between">
                <GridSizeSelector
                  value={gridSize}
                  onChange={setGridSize}
                  disabled={isLocked}
                />
                
                <div className="flex gap-4 print:hidden">
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                    onClick={undo}
                    disabled={currentIndex <= 0}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                  
                  <button
                                                         className={`p-2 rounded-md ${
                                                           !isLocked ? 'bg-white text-gray-400 cursor-not-allowed' : 'hover:bg-orange-100 bg-orange-500 text-white'
                                                         }`}
                                                         onClick={handleReset}
                                                         title="Reset Grid"
                                                         disabled={!isLocked}
                                                       >
                                                         <RotateCcw className="w-5 h-5" />
                                                       </button>
                  
                  <button
                    className={`p-2 rounded-md hover:bg-gray-100 text-gray-700 ${
                      isLocked ? 'bg-gray-200' : ''
                    }`}
                    onClick={handleLock}
                    title={isLocked ? "Unlock Grid" : "Lock Grid"}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Unlock className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                    onClick={handleStop}
                    title="Stop"
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
                    onClick={handlePrint}
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-grow max-w-7xl mx-auto px-4 py-8 flex justify-center">
            <div className="flex">
              <div className="flex items-center">
                <div className="mr-2"></div>
                <div className="bg-white p-8 print:p-0 print:bg-white flex items-center justify-center p-2.5 relative">
                  <input
                    type="text"
                    className="absolute top-[20px] left-[calc(2px_-_25px)] w-[50px] h-[25px] text-white font-bold rounded-md p-1 text-center"
                    style={{ backgroundColor: 'rgba(100, 100, 100, 0.5)' }}
                  />
                  <Grid
                    rows={gridSize.rows}
                    cols={gridSize.cols}
                    walls={walls}
                    onWallToggle={handleWallToggle}
                    cellValues={cellValues}
                    onCellClick={handleCellClick}
                    selectedSmallNumber={selectedSmallNumber}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center ml-4 bg-white p-2.5 justify-center mt-2.5 mb-2.5 rounded-md">
                {[1, 2, 3, 4, 5].map(number => {
                  const isSelected = selectedNumber === number;
                  return (
                    <div key={number} className="flex items-center">
                      <button
                        className={`rounded-md font-semibold transition-colors border-2 border-gray-600 mb-3 w-13 h-13 text-xl ${
                                            isSelected ? 'bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                          }`}
                        style={{ marginBottom: '0.75rem' }}
                        onClick={() => {
                          setSelectedNumber(isSelected ? null : number);
                          setSelectedSmallNumber(null);
                        }}
                      >
                        {number}
                      </button>
                      <button
                        className={`rounded-md font-semibold transition-colors border-2 border-gray-600 w-8 h-8 text-sm ${
                                                selectedSmallNumber === number ? 'bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                              }`}
                                              disabled={!isLocked && isSettingKeys}
                                              style={{ marginLeft: '10px', position: 'relative', top: '-25px' }}
                                              onClick={() => {
                                                setSelectedSmallNumber(selectedSmallNumber === number ? null : number);
                                                setSelectedNumber(null);
                                              }}
                      >
                        {number}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      );
    }
    
    export default App;