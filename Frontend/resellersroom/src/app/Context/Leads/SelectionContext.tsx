"use client"
import { createContext, useContext, useState,ReactNode } from 'react';
import {Suggest} from "../../Components/Small comps/Types"


interface SelectionContextType {
  selectedItems: Suggest|null;
  addItem: (item: Suggest) => void;
  Toggleleadsrenderstep:(num:number)=>void;
  renderstep:number,
  direction:number,
}



const SelectionContext = createContext<SelectionContextType | undefined>(undefined);


interface SelectionProviderProps {
  children: ReactNode;
}


export const SelectionProvider = ({ children }: SelectionProviderProps) => {

  const [selectedItems, setSelectedItems] = useState<Suggest|null>(null);
  const [renderstep,setrenderstep]=useState<number>(0)
  const [direction,setDirection]=useState<number>(1)
  const addItem = (item: Suggest) => {
    setSelectedItems(item)
  };

 
  const Toggleleadsrenderstep=(num:number)=>{
    setDirection(num > renderstep ? 1 : -1);
    setrenderstep(num)
  }
  
  


  return (
    <SelectionContext.Provider value={{ selectedItems, addItem,Toggleleadsrenderstep,renderstep,direction }}>
      {children}
    </SelectionContext.Provider>
  );
};


export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};

export { SelectionContext };
