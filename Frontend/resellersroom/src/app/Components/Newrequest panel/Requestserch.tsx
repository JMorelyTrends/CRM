import React,{useState} from "react";

// type Props = {
//   search:string,
//   setsesetsearch:React.Dispatch<React.SetStateAction<string>>
// };

function Requestserch({Getdata}: {Getdata:(msg:string)=>void}) {
  const [t,sett]=useState("");
  return (
    <div className="w-full   lg:h-[18%] md:[19%] h-[12%] flex flex-col items-center p-2">
      <div className="flex-1  ml-4 flex justify-start items-center w-full capitalize text-black">
        <h3>Search for product</h3>
      </div>
      <div className="w-[95%] flex items-center border border-gray-300 bg-white rounded-xl shadow-2xl overflow-hidden px-2">
        <div className="cursor-pointer w-[5%] h-full flex justify-center items-center">
          <img src="/images/search.png" alt="Search" className="p-2" />
        </div>
        <input
          type="text"
          placeholder="Search by brand"
          className="w-full h-full p-2 outline-none text-gray-700"
          value={t}
          onChange={(e)=>{
            sett(e.target.value)
          }}
          onKeyUp={event=>{
            if(event.key=='Enter')
            {
              Getdata(t)
            }
          }}
        />
      </div>
    </div>
  );
}

export default Requestserch;
