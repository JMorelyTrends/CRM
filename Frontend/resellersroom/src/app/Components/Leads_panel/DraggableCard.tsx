import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskPanel } from './TaskPanel';
import { Clock } from 'lucide-react';
import { Task } from "../Small comps/Types";




interface DraggableCardProps {
  task: Task;

  disableDrag?: boolean;
  Manualcolchange: (newStage: string, oldstage: string, taskid: number, task: Task) => void;
  fetchallorders: () => void;
}

const columnOptions = ["NewLead", "NeedToSource", "Offered", "WarmLead", "Won", "Lost"];

const DraggableCard: React.FC<DraggableCardProps> = ({ task, disableDrag = false, Manualcolchange, fetchallorders }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: String(task.id),
    disabled: disableDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedCol, setSelectedCol] = useState(task.stage);
  const [startpos, setStartpos] = useState<{ x: number, y: number } | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [clickedTask, setClickedTask] = useState<Task |null>(null);
  const [creationdate, setCreationDate] = useState<string>("");

  useEffect(() => {
    const date = new Date(task.createdAt);
    const formatted = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
    setCreationDate(formatted);
  }, []);

  const handleClickDown = (e: React.MouseEvent) => {
    setStartpos({ x: e.clientX, y: e.clientY });
  };

  const handleClickUp = (e: React.MouseEvent) => {
    if (startpos) {
      const x = e.clientX - startpos.x;
      const y = e.clientY - startpos.y;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < 5 && task) {
        setClickedTask(task);
        
        setShowPanel(true);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      onPointerDown={handleClickDown}
      onPointerUp={handleClickUp}
      style={style}
      {...(!disableDrag && listeners)}
      {...(!disableDrag && attributes)}
      className={`relative w-[190px] h-[235px] text-black ${
        task.stage === 'Won' ? 'bg-[#B7CBAF]' :
        task.stage === 'Lost' ? 'bg-[#B56060]' : 'bg-[#D9D9D9]'
      } rounded-xl cursor-pointer flex flex-col transition-all duration-300 ease-in-out shadow-lg shadow-black hover:border-amber-50 border`}
    >
      {showPanel && <TaskPanel open={showPanel} setOpen={setShowPanel} task={clickedTask} fetchallorders={fetchallorders} />}

      {/* Dropdown */}
      <div className="absolute top-2 right-2 sm:block md:hidden z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(!openDropdown);
          }}
          className="text-lg font-bold hover:bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"
        >
          ⋯
        </button>

        {openDropdown && (
          <div className="absolute top-8 right-0 bg-white rounded-md shadow-lg w-32 py-1 z-50">
            {columnOptions.map((colName) => (
              <button
                key={colName}
                onClick={() => {
                  Manualcolchange(colName, selectedCol, task.id, task);
                  setSelectedCol(colName);
                  setOpenDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                {colName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="h-[45%] flex justify-center items-center">
        <div className="w-[76%] h-[95%] rounded-2xl flex justify-center bg-white overflow-hidden">
          <img
            src={task?.stockxitem[0]?.image}
            alt=""
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>

      {/* Bottom content */}
      <div className="h-[55%] rounded-xl flex flex-col justify-between items-center px-2 pt-1 text-sm">
        {/* Tags */}
        <div className="w-full flex flex-wrap gap-2 items-center justify-start min-h-[24px]">
          {task.labels?.map((label, index) => (
            <div
              key={index}
              className={`relative group w-6 h-3 rounded-full cursor-pointer ${label.label.col}`}
             
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10">
                {label.label.name}
              </div>
            </div>
          ))}
        </div>

        {/* Name */}
        <div className="w-full font-bold text-md truncate">{task.Name}</div>

        {/* StockX Name */}
        <div className="w-full text-xs font-bold truncate">{task.stockxitem[0]?.name}</div>

        {/* Condition */}
        <div className="w-full text-xs font-bold truncate">{task.condition}</div>

        {/* Size */}
        <div className="w-full text-xs font-bold truncate">{task.size}</div>

        {/* Created Date */}
        <div className="w-full flex justify-start items-start  gap-1 mt-1">
          <div className="rounded-2xl flex items-center gap-1 bg-[#374D71] text-white text-[10px] px-2 py-1  ">
            <Clock color="white" size={14} />
            <span>{creationdate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableCard;
