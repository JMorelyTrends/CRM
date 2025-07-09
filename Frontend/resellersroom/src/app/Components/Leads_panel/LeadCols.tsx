import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task,column } from '../Small comps/Types';
import dynamic from "next/dynamic";
const DraggableCard = dynamic(() => import("./DraggableCard"), { ssr: false });

type Props = {
  className: string;
  Colname: string;
  column: column;
  tasks: Task[];
  disableDrag?: boolean; 
  Manualcolchange:(newStage: string ,oldstage:string, taskid:number, task_id:object)=>void;
  fetchallorders: () => void;
  search:string
};

const LeadCols = (props: Props) => {

  const [totalprice,settotalprice]=useState<number>(0)
  useEffect(()=>{

    let c=0;
    if(props.tasks.length>0)
    {
      props.tasks.map((task:Task)=>{
        if(task.stockxitem.length>0 && task?.stockxitem[0]?.last_sale_price){
          if(task.price==0){
        c+=task?.stockxitem[0]?.last_sale_price;
      }
        else{
          c+=task?.price||0
        }
      }
        else if( task?.items?.length&& task?.items?.length >0){
          if(task.price==0){
            c+=task.items[0].price;
          }
            else{
              c+=task?.price||0
            }
        }
        settotalprice(c)
      })
    }
    else{
      settotalprice(0)
    }
    
  },[props.tasks])
  const taskMatchesSearch = (task: Task, search: string): boolean => {
    const searchLower = search.toLowerCase();
  
    // Collect all possible fields as strings
    const fieldsToSearch: string[] = [
      task.Name ?? '',
      task.email ?? '',
      task.phone ?? '',
      task.condition ?? '',
      task.size ?? '',
      ...(task.labels?.map(labelObj => labelObj.label?.name ?? '') ?? []),
      ...(task.stockxitem?.map(stockx => stockx.name ?? '') ?? []),
      ...(task.items?.map(item => item.Name ?? '') ?? []),
    ];
  
    // Return true if any field includes the search string
    return fieldsToSearch.some(field =>
      field.toLowerCase().includes(searchLower)
    );
  };

  const { setNodeRef } = useDroppable({
    id: props.column.id, 
  });
  return (
    <div className="lg:w-[20vw] lg:h-[90vh] w-[70vw] h-[80vh]  flex flex-col py-3 px-2 ">
    
      <div className="text-black  font-semibold text-center mb-2 mt-2 flex justify-center gap-2  items-center">
       <div className=" text-md flex bg-blacks w-fit gap-2 "> <div className="">{props.Colname}</div>{`(${props.tasks.length})`}</div>   
       <div className=" bg-[#374D71CC] w-[30%] h-full rounded-lg text-md text-white">£ {totalprice}</div>
      </div>    
      <div
        className="flex-1 overflow-y-auto 
        [&::-webkit-scrollbar]:hidden
        dark:[&::-webkit-scrollbar]:hidden
        scrollbar-thin"
        ref={setNodeRef}
      >
        <SortableContext
          items={props.tasks&&props.tasks.map((task) => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex  flex-col items-center gap-5  transition-all duration-300 ease-in-out">
            {
            props.tasks
            .filter(task => taskMatchesSearch(task, props.search))
            .map((task: Task) => (
                <DraggableCard key={task._id} task={task} disableDrag={props.disableDrag} Manualcolchange={props.Manualcolchange} fetchallorders={props.fetchallorders}/>
           )
           )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default LeadCols;