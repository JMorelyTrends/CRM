"use client";
import React, { useEffect, useState } from "react";
import Requestpanle from '../Components/Newrequest panel/Requestpanle';
import Newcustomer from "../Components/Newrequest panel/Newcustomer";
import { Suggest } from "../Components/Small comps/Types";
import { AddtagsDes } from "../Components/Newrequest panel/AddtagsDes";
import Reqsubmit from "../Components/Newrequest panel/Reqsubmit";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useSelector,useDispatch } from 'react-redux';
import { RootState } from "@/lib/Resellerstore";
import {Addselectedcusotmer, Toggleleadsrenderstep}from "@/lib/features/Newrequest/NewRequestSlice"
import { AddSelectedCustomer } from "@/lib/features/CustomerCrm/CustomerCrmslice";

type DirectionProps = {
  direction: number;
};

const variants: Variants = {
  enter: (custom: DirectionProps) => ({
    x: custom.direction > 0 ? 300 : -300,
    opacity: 0,
    position: "absolute",
    zIndex: 3,
  }),
  center: {
    x: 0,
    opacity: 1,
    position: "absolute",
    zIndex: 4,
  },
  exit: (custom: DirectionProps) => ({
    x: custom.direction > 0 ? -300 : 300,
    opacity: 0,
    position: "absolute",
    zIndex: 3,
  }),
};

const Page: React.FC = () => {
  const dispatch=useDispatch();
  const [suggesteddata, setsuggesteddata] = useState<Suggest[]>([]);
  const renderstep = useSelector((state: RootState) => state.NewReq.renderstep);
  const direction = useSelector((state: RootState) => state.NewReq.direction);
  
  useEffect(()=>{
   dispatch(Toggleleadsrenderstep(0))
   dispatch(Addselectedcusotmer(null))
   dispatch(AddSelectedCustomer(null))
  },[])
  // If you need sideOpen or className — move them into context or global state

  return (
    <div className="relative w-[80vw] h-full flex justify-center items-center overflow-hidden">
      {renderstep === 0 && (
        <Requestpanle
          sideopen={true} // <- replace with whatever logic or remove if not used
          suggesteddata={suggesteddata}
          setsuggesteddata={setsuggesteddata}
        />
      )}

      {[2, 3, 4].includes(renderstep) && (
        <motion.div
          key="step2"
          custom={{ direction }}
          initial="enter"
          animate={renderstep === 2 ? "center" : "exit"}
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex justify-center items-center"
          style={{ zIndex: renderstep === 2 ? 3 : 2 }}
        >
          <Reqsubmit sideopen={true} />
        </motion.div>
      )}

      <AnimatePresence mode="wait" custom={{ direction }}>
        {renderstep === 3 && (
          <motion.div
            key="step3"
            custom={{ direction }}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.5 }}
            className="w-full bg-white h-full flex justify-center items-center"
            style={{ zIndex: 4 }}
          >
            <Newcustomer sideopen={true} />
          </motion.div>
        )}

        {renderstep === 4 && (
          <motion.div
            key="step4"
            custom={{ direction }}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.5 }}
            className="w-full  h-full flex justify-center items-end"
            style={{ zIndex: 4 }}
          >
         <AddtagsDes sideopen={true}  />
          </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
};

export default Page;