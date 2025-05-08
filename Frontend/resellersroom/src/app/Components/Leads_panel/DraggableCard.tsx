import React, { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskPanel } from './TaskPanel';
import { Clock } from 'lucide-react';
import { Task } from "../Small comps/Types";




interface DraggableCardProps {
  task: Task;
search:string;
  disableDrag?: boolean;
  Manualcolchange: (newStage: string, oldstage: string, taskid: number, task: Task) => void;
  fetchallorders: () => void;
}
const columnOptions = ["NewLead", "NeedToSource", "Offered", "WarmLead", "Won", "Lost"];

const DraggableCard: React.FC<DraggableCardProps> = ({ task, search,disableDrag = false, Manualcolchange, fetchallorders }) => {
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
  const [creationdate, setCreationDate] = useState<string>(task?.stockxitem[0]?.image);
  
  const [openlabeldialog,setopenlabeldialog]=useState<boolean>(false)
  const [image,setimage]=useState<string>("")
 
  useEffect(() => {
    const date = new Date(task.createdAt);
    const formatted = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}`;
    setCreationDate(formatted);
    
    //select which image to show
    if(task.items&&task.items?.length>0)
    {
       setimage(task.items[0].itempics[0])
       //console.log(task.items[0].itempics[0])
    }
    else{
      setimage(task?.stockxitem[0]?.image)
    }


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
        if(task.stage!='Won')
        {
          setShowPanel(true);
        }
        else{
          
        }
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
      className={`relative w-[94%] h-[300px] text-black ${
        task.stage === 'Won' ? 'bg-[#B7CBAF]' :
        task.stage === 'Lost' ? 'bg-[#B56060]' : 'border-1 border-black '
      } rounded-md cursor-pointer flex flex-col transition-all duration-300 ease-in-out  hover:shadow-lg hover:shadow-black`}
    >
      {showPanel && <TaskPanel setopenlabeldialog={()=>false}  openlabeldialog={false} open={showPanel} setOpen={setShowPanel} task={clickedTask} fetchallorders={fetchallorders} />}

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
      <div className="h-[35%]  flex justify-center items-center">
        <div className="w-[76%] h-full rounded-2xl flex justify-center overflow-hidden">
          <img
            src={image?image:"no image"}
            alt=""
            className="w-full h-full object-cover rounded-2xl p-2"
          />
        </div>
      </div>

   {/* Bottom content */}
<div className="h-[65%] rounded-xl flex flex-col justify-center items-center px-2 gap-1  text-sm w-full">

          {/* Tags */}
          <div className="w-full flex gap-2 items-center justify-start min-h-[24px] flex-wrap ">
            {task.labels?.slice(0, 3).map((label, index) => (
              <div
                key={index}
                className={`relative group w-10 h-5 rounded-full cursor-pointer ${label.label.col}`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-10">
                  {label.label.name}
                </div>
              </div>
            ))}
          
            {task.labels && task.labels.length > 4 && (
              <div className="text-xs text-gray-600">
                +{task.labels.length - 3} more
              </div>
            )}
          </div>
          
          {/* Name */}
          <div className="w-full font-bold text-md truncate ">{task?.Name}</div>

          <div className="w-full text-xs font-semibold truncate text-[#4774B1] ">
            {task?.email}
          </div>
          <div className="w-full text-xs font-semibold truncate text-[#4774B1] ">
            {task?.phone!=null?task.phone:" "}
          </div>
           
          {/* StockX and manual item Name */}
          <div className="w-full text-xs font-semibold truncate ">
            {task.stockxitem.length > 0 ? task.stockxitem[0]?.name : task.items && task.items[0]?.Name}
          </div>
          
        
           {/* StockX and manual item Name */}
           <div className="w-full text-xs font-light truncate ">
            {task.condition}
          </div>
           {/* StockX and manual item Name */}
           <div className="w-full text-xs font-light truncate ">
            {task.size}
          </div>
          
          {/* Created Date */}
          <div className="w-full flex justify-start items-start gap-1 mt-1 ">
            <div className="rounded-2xl flex items-center gap-1 bg-[#374D71] text-white text-[10px] px-2 py-1">
              <Clock color="white" size={14} />
              <span>{creationdate}</span>
            </div>
          </div>

</div>

    </div>
  );
};

export default DraggableCard;
