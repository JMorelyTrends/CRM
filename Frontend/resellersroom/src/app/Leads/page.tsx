"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import DraggableCard from "../Components/Leads_panel/DraggableCard";
import axios from "axios";
import { useDispatch } from "react-redux";
import EditPopup from "../Components/Customer/Editpopup";
//import { Reseller, RootState } from "@/lib/Resellerstore";
import {  Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { AddSelectedCustomer ,Toogle_Editopen } from "@/lib/features/CustomerCrm/CustomerCrmslice";
import { statetype, Task } from "../Components/Small comps/Types";
import {CompleteOrderPopup } from "../Components/Leads_panel/CompleteOrderPopup"
import { useIsSmallScreen } from "../Components/Small comps/Issmall";
import { Addcurrentorder, AddOrderid, AddSelectedOrder,ToogleCompleteorder } from "@/lib/features/OrederReview/OrderReviewSlice";
import { Funnel, ChevronDown } from "lucide-react";

const LeadCols = dynamic(() => import("../Components/Leads_panel/LeadCols"), {
  ssr: false,
});


type Props = object;



export default function Page({}: Props) {
  const dispatch = useDispatch();
  const [state, setstate] = useState<statetype | null>(null);
  const [activeCard, setActiveCard] = useState<Task | null>(null);
  const [smcolumn, setsmcolumn] = useState<string>("New Lead");
  const [userid, setuserid] = useState<string | null>("");
  const [search,setserach]=useState<string>("")
  const [wonpopup,setwonpopup]=useState<boolean>(false)
  const [wontask,setwontask]=useState<Task|null>(null)
  const [leadFilter, setLeadFilter] = useState<"" | "complete" | "incomplete">("");

  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 10,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
  }, []);

  const fetchallorders = async () => {
    if (userid != "") {
      const mongodata = (
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getAllOrders`,
          {
            id: userid,
          }
        )
      ).data;
     console.log(mongodata) 
      setstate(mongodata);
    
    }
  };

  useEffect(() => {
    if (userid) {
      fetchallorders();
    }
  }, [userid]);


  // const getprices = async (currentState: statetype) => {
  // if (!currentState || lockRef.current) return;

  // const stateCopy = { ...currentState };
  // const columnOrder = stateCopy.columnOrder;

  // for (const ColumnId of columnOrder) {
  //   const column = stateCopy.columns[ColumnId];
  //   const tasks = column.taskIds.map((taskId) => stateCopy.tasks[taskId]);

  //   for (const task of tasks) {
  //     const item = task?.stockxitem?.[0];
  //     if (item && item.last_sale_price === 0 && !lockRef.current) {
  //       lockRef.current = true; // 🔒 Lock

  //       try {
  //         await axios.post(
  //           `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Stockx/Getproductprice`,
  //           {
  //             itemid: item._id,
  //             search: item.slug,
  //           }
  //         );

  //         const mongodata = (
  //           await axios.post(
  //             `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getAllOrders`,
  //             {
  //               id: userid,
  //             }
  //           )
  //         ).data;

  //         setstate(mongodata);

  //         // 🕐 Wait then call getprices again with fresh state
  //         setTimeout(() => {
  //           lockRef.current = false; // 🔓 Unlock before next call
  //         // Call recursively with new state
  //         }, 1000); // delay 1s

  //       } catch (err) {
  //         console.error("Error fetching price or orders:", err);
  //         lockRef.current = false; // Always release lock
  //         return;
  //       }
  //     }
  //   }
  // }

  // console.log("No more items needing price updates.");
  // };
  const isSmallScreen = useIsSmallScreen();

  const DragStart = (event: DragStartEvent) => {
    if (state) {
      const { active } = event;
      const taskId = parseInt(active.id as string);
      const task = findTaskById(state, taskId);

      // const colId = findColumnByTaskId(state, taskId);

      setActiveCard(task);
    }
  };

  const findTaskById = (state: statetype, id: number) => {
    return state.tasks[id];
  };

  const findColumnByTaskId = (state: statetype, taskId: number): string => {
    for (const colId of Object.keys(state.columns)) {
      if (state.columns[colId].taskIds.includes(taskId)) {
        return colId;
      }
    }
    return "";
  };

  // Basic timeout wrapper
function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  const confirmorder=(id:number|string)=>
  {
    const n=Number(id);
    return state?.tasks[n]?.confirm

  }



  const DragEnd = async(event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return setActiveCard(null);
   
    if (state) {
      const taskid = parseInt(active.id as string);
      const currenttask = findTaskById(state, taskid);

      const overId = over.id;

      const sourceColId = findColumnByTaskId(state, taskid);
      // CASE 1: over.id is a column → dropped into empty space in column
      const isOverAColumn = state.columns.hasOwnProperty(overId);
      const isconfirmorder=confirmorder(active?.id);
     
      if(isconfirmorder)
        {
         setActiveCard(null)
         return
        }
      const destinationColId = isOverAColumn 
        ? overId
        : findColumnByTaskId(state, parseInt(overId as string));

      if (!destinationColId) return setActiveCard(null);

      const sourceCol = state.columns[sourceColId];
      const destinationCol = state.columns[destinationColId];
   
      if (sourceColId === destinationColId) {
        // Reordering in the same column
        const oldIndex = sourceCol.taskIds.indexOf(taskid);

        const newIndex = isOverAColumn
          ? sourceCol.taskIds.length
          : sourceCol.taskIds.indexOf(parseInt(overId as string));

        if (oldIndex === newIndex) {
          setActiveCard(null);
          return;
        }

        const newTaskIds = [...sourceCol.taskIds];
        newTaskIds.splice(oldIndex, 1); // remove active
        newTaskIds.splice(newIndex, 0, taskid); // insert at new index

        const newState = {
          ...state,
          columns: {
            ...state.columns,
            [sourceColId]: {
              ...sourceCol,
              taskIds: newTaskIds,
            },
          },
        };
        
        setstate(newState);
        setActiveCard(null);
 
        return;
      }

      // CASE 2: Moving to a different column
      const newSourceTaskIds = sourceCol.taskIds.filter((id) => id !== taskid);

      const newDestinationTaskIds = isOverAColumn
        ? [...destinationCol.taskIds, taskid] // just push at end
        : (() => {
            const index = destinationCol.taskIds.indexOf(
              parseInt(overId as string)
            );
            const updated = [...destinationCol.taskIds];
            updated.splice(index, 0, taskid);
            return updated;
          })();

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [sourceColId]: {
            ...sourceCol,
            taskIds: newSourceTaskIds,
          },
          [destinationColId]: {
            ...destinationCol,
            taskIds: newDestinationTaskIds,
          },
        },
        tasks: {
          ...state.tasks,
          [active.id]: {
            ...state.tasks[Number(active.id)],
            stage: destinationCol.title,
          },
        },
      };
    
      setstate(newState);
      setActiveCard(null);
      try{await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/UpdateStages`,
        {
          taskid: currenttask,
          newstage: destinationCol.id,
        }
      );
     
      if(destinationCol.title=='Won')
      {
        await timeout(700);
        if(currenttask.cusid&& currenttask.cusid?.email!="" && currenttask?.phone!="")
        {
          setwontask(currenttask)
          dispatch(Addcurrentorder(currenttask))
          setwonpopup(true)
          dispatch(ToogleCompleteorder())
          dispatch(AddSelectedOrder(currenttask))
        }
        else{
          dispatch(AddSelectedCustomer(currenttask.cusid))
          dispatch(AddOrderid(currenttask._id))
          dispatch(Toogle_Editopen())
        }
      }
    }
      catch (error) {
        console.error("Error updating stages:", error);
      }
    }
  };

  const Manualcolchange = (
    newStage: string,
    oldstage: string,
    taskid: number,
    task_id: object
  ) => {
    if (state) {
      const sourceCol = state.columns[oldstage];
      const newSourceTaskIds = sourceCol.taskIds.filter(
        (id: number) => id !== taskid
      );

      const destinationCol = state.columns[newStage];

      const isOverAColumn = state.columns.hasOwnProperty(newStage);

      const newDestinationTaskIds = isOverAColumn
        ? [...destinationCol.taskIds, taskid] // just push at end
        : (() => {
            const index = destinationCol.taskIds.indexOf(parseInt(newStage));
            const updated = [...destinationCol.taskIds];
            updated.splice(index, 0, taskid);
            return updated;
          })();

      const n = {
        ...state,
        columns: {
          ...state.columns,
          [oldstage]: {
            ...sourceCol,
            taskIds: newSourceTaskIds,
          },
          [newStage]: {
            ...destinationCol,
            taskIds: newDestinationTaskIds,
          },
        },
        tasks: {
          ...state.tasks,
          [taskid]: {
            ...state.tasks[Number(taskid)],
            stage: destinationCol.title,
          },
        },
      };
      setstate(n);
      setActiveCard(null);
   try {  axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/UpdateStages`,
        {
          taskid: task_id,
          newstage: newStage,
        }
      );}
      catch (error) {
        console.error("Error UpdateStages:", error);
      }
    }
  };

  return (
    <DndContext onDragStart={DragStart} onDragEnd={DragEnd} sensors={sensors}>
       {/* Header with Leads label and search bar */}
     {/* Header with Leads label and search bar */}
     {wonpopup && wontask  &&<CompleteOrderPopup  fetchallorders={fetchallorders} open={wonpopup} setOpen={setwonpopup}  update={false} />}

     <EditPopup getcustomers={fetchallorders} method="leads" /> 
   {
   !isSmallScreen&& 
   
   <div className="w-[80vw] flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <img 
          src="/images/Lead.png" 
          alt="Leads Icon" 
          className="w-8 h-8 text-gray-800 dark:text-[#888888]"
        />
        <h1 className="text-3xl font-semibold text-[#888888] dark:text-[#888888] mr-5">Lead Management</h1>
        <ContactFilterDropdown selectedState={leadFilter} setSelectedState={setLeadFilter} />
      </div>
      <input
        type="text"
        value={search}
        onChange={(e)=>{
          setserach(e.target.value)
        }}
        placeholder="Search by customer and product "
        className="w-full lg:w-54 px-4 py-2 border-2 text-xs p-4 text-black border-gray-300 rounded-lg "
      />
    </div>
    
    }


      <div className="overflow-x-auto pb-4 w-full">
      <div className="flex w-max space-x-4">
      {!isSmallScreen 
      ? (
        <div
          className="w-[80vw] lg:w-[80vw] md:w-[60vw] lg:visible hidden flex-nowrap  px-0.5 h-[90vh]  lg:flex gap-2 justify-start items-center overflow-x-auto
       [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 "
        >
          
          <div className="flex gap-1">
            {state &&
              state.columnOrder &&
              state.columnOrder.map((ColumnId, index) => {
                const column = state.columns[ColumnId];
                let tasks = column.taskIds.map((taskId) => state.tasks[taskId]);
                if (leadFilter === "complete") {
                  tasks = tasks.filter(task => task.cusid && (task.cusid.email || task.cusid.Number));
                } else if (leadFilter === "incomplete") {
                  tasks = tasks.filter(task => !task.cusid || (!task.cusid.email && !task.cusid.Number));
                }
                return (
                  <LeadCols
                    key={index}
                    className=""
                    Colname={column.title}
                    column={column}
                    tasks={tasks}
                    search={search}
                    disableDrag={isSmallScreen}
                    Manualcolchange={Manualcolchange}
                    fetchallorders={fetchallorders}
                  />
                );
              })}
          </div>
        </div>
      ) :
       (
        <div className=" lg:hidden  visible w-[100vw] h-[100vh] flex-col  flex items-center">
          <div className=" w-full  h-[5vh] flex justify-center item-center ">
            <select
              id="condition"
              value={smcolumn}
              onChange={(e) => {
                setsmcolumn(e.target.value);
              }}
              className="bg-gray-50 border border-black text-gray-900 text-sm rounded-lg  p-2.5 ml-1.5"
            >
              <option value="New Lead">NewLead</option>
              <option value="Need To Source">Need To Source</option>
              <option value="Offered">Offered</option>
              <option value="Warm Lead">WarmLead</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {state &&
            state.columnOrder &&
            state.columnOrder.map((ColumnId, index) => {
              const column = state.columns[ColumnId];
              const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);
              if (smcolumn == ColumnId) {
                return (
                  <LeadCols
                    key={index}
                    search=""
                    className=""
                    Colname={column.title}
                    column={column}
                    tasks={tasks}
                    disableDrag={isSmallScreen}
                    Manualcolchange={Manualcolchange}
                    fetchallorders={fetchallorders}
                  />
                );
              } // Fetch your MongoDB data here if needed
            })}
        </div>
      )}
</div>
      </div>
      <DragOverlay>
        {activeCard ? (
          <DraggableCard
            task={activeCard}
            disableDrag
            Manualcolchange={Manualcolchange}
            fetchallorders={fetchallorders}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// state for kanban system
// const initialData = {
//   tasks: {
//     "1": { id: 1, content: "Configure Next.js application" },
//     "2": { id: 2, content: "Configure Next.js and tailwind " },
//     "3": { id: 3, content: "Create sidebar navigation menu" },
//     "4": { id: 4, content: "Create page footer" },
//     "5": { id: 5, content: "Create page navigation menu" },
//     "6": { id: 6, content: "Create page layout" },
//   },
//   columns: {
//     NewLead: {
//       id: "NewLead",
//       title: "New Lead",
//       taskIds: [1, 2, 3, 4],
//     },
//     NeedToSource: {
//       id: "NeedToSource",
//       title: "Need To Source",
//       taskIds: [5],
//     },
//     Offered: {
//       id: "Offered",
//       title: "Offered",
//       taskIds: [],
//     },
//     WarmLead: {
//       id: "WarmLead",
//       title: "Warm Lead",
//       taskIds: [6],
//     },
//     Won: {
//       id: "Won",
//       title: "Won",
//       taskIds: [],
//     },
//     Lost: {
//       id: "Lost",
//       title: "Lost",
//       taskIds: [],
//     },
//   },
//   columnOrder: [
//     "NewLead",
//     "NeedToSource",
//     "Offered",
//     "WarmLead",
//     "Won",
//     "Lost",
//   ],
// };


interface ContactFilterDropdownProps {
  selectedState: "" | "complete" | "incomplete";
  setSelectedState: (val: "" | "complete" | "incomplete") => void;
}

const ContactFilterDropdown: React.FC<ContactFilterDropdownProps> = ({ selectedState, setSelectedState }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-fit ">
      <button
        type="button"
        onClick={() => setIsDropdownOpen((open) => !open)}
        className="flex items-center text-black gap-2 px-4 py-2 bg-white border border-black rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Funnel size={16} />
        <span className="text-sm font-medium">
          {selectedState === "complete"
            ? "Complete"
            : selectedState === "incomplete"
            ? "Incomplete"
            : "All Leads"}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full text-black left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px] py-1"
        >
          <div
            onClick={() => {
              setSelectedState("");
              setIsDropdownOpen(false);
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-50"
          >
            All Leads
          </div>
          <div
            onClick={() => {
              setSelectedState("complete");
              setIsDropdownOpen(false);
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-50"
          >
            Complete
          </div>
          <div
            onClick={() => {
              setSelectedState("incomplete");
              setIsDropdownOpen(false);
            }}
            className="px-4 py-2 cursor-pointer hover:bg-gray-50"
          >
            Incomplete
          </div>
        </div>
      )}
    </div>
  );
};
