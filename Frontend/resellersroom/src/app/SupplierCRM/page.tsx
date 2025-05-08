"use client";
import React,{useEffect,useState} from "react";
import {ArrowUpNarrowWide,Funnel } from "lucide-react"
import NewSup from "../Components/Suppliers/NewSup";
  type pageProps = object;
 
  type hprops={
    search:string,
    setsearch:React.Dispatch<React.SetStateAction<string>>
  }


  const Header=(props:hprops)=>{
    
    return(
        < >   
            <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white  sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
               
                        <div className="w-[40px] h-[40px]">
                            <img src="/images/supplier.png" className=" w-full h-full" />
                        </div>
                       <h1 className=" text-3xl font-semibold text-[#888888] dark:text-[#888888]">Supplier CRM</h1>
                             
                       </div>
            
               <input
                 type="text"
                 value={props.search}
                 onChange={(e)=>{
                   props.setsearch(e.target.value)
                 }}
                 placeholder="Search by customer and product "
                 className="w-full lg:w-54 px-4 py-2 border-2 text-xs p-4 text-black border-gray-300 rounded-lg "
               />
             </div>
        
        </>
    )
  }



const page: React.FC<pageProps> = () => {
    
  function useIsSmallScreen() {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
  
    useEffect(() => {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 1024);
      };
  
      handleResize(); // Initial check
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return isSmallScreen;
  }
  const isSmallScreen=useIsSmallScreen();
 
  const [search,setsearch ]=useState<string>("")
  const [Newopen,setNewopen]=useState<boolean>(false)

  return (
    <>
      <div className="w-full h-[100vh]  flex flex-col">
     {/**popups */}

     <NewSup
     Newopen={Newopen}
     setNewopen={setNewopen}
     />

        {/**Header */}

        { !isSmallScreen&& <Header
             search={search}
             setsearch={setsearch}
        />}

        {/*ADD new Supplier */}
        <div className="w-full h-[8vh] mt-[2vh] bg-white flex justify-items-start items-end">
            <button
            className="w-[25%] h-full ml-5 bg-[#454545] text-white font-bold rounded-2xl cursor-pointer hover:border-black"
            onClick={()=>{
                setNewopen(true)
            }}
            >
              Add New Suplier
            </button>
        </div>
         

          {/*Fillters */}
          <div className="w-full h-[12vh] mt-[3vh]  flex flex-col justify-between items-start text-black">
                  
                  <div className=" w-[40vw] h-full flex ml-13 flex-col justify-around items-start ">
                    <div className="flex w-full h-[40%]">
                    <div className="tex-3xl font-bold">All Suppliers</div>
                    <div className="text-[10px] font-extralight flex items-end"><div className="">(250)</div></div>
                   </div>

                   <div className="flex justify-start gap-8 w-full h-[60%]  ">

                             <div className="w-[10%] h-full  flex items-end gap-1.5 ">
                                   <div className="text-sm mb-0.5">
                                    sortby
                                   </div>
                                   <div className="">
                                   <ArrowUpNarrowWide />
                                   </div>
                                </div>       
                                <div className="w-[10%] h-full  flex items-end gap-1.5 ">
                                   <div className="text-sm mb-0.5">
                                    fillter
                                   </div>
                                   <div className="">
                                   <Funnel />
                                   </div>
                                </div>                          
        
                   </div>
                   
                  </div>

          </div>



       {/* Cards Container */}
       <div className="w-full h-[65vh] flex gap-4 overflow-y-auto flex-wrap p-4
        [&::-webkit-scrollbar]:w-1
           [&::-webkit-scrollbar-track]:bg-gray-100
           [&::-webkit-scrollbar-thumb]:bg-black
           dark:[&::-webkit-scrollbar-track]:bg-neutral-700
           dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 
       
       ">
         {[...Array(10)].map((_, idx) => ( // Example 10 cards
           <div
             key={idx}
             className="w-[30%] min-w-[30%] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center text-black shadow"
           >
             Card {idx + 1}
           </div>
         ))}
       </div>



      </div>
    </>
  );
};
export default page;
