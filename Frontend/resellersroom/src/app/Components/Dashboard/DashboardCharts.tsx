
"use client";
import React,{useEffect,useState} from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";



const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];



const DashboardCharts = ({internval,setinternval}:{internval:string,setinternval:React.Dispatch<React.SetStateAction<string>>}) => {
   

//states
 const [pieData, setPieData] = useState([]);
 const [userid,setuserid]= useState<string | null>("");
 const [reqwon,setreqwon]=useState( [
           { name: "Jan", Won: 400, Requst: 240 },
           { name: "Feb", Won: 300, Requst: 139 },
           { name: "Mar", Won: 200, Requst: 980 },
           { name: "Apr", Won: 278, Requst: 390 },
      ])

 
  const [wonlost,setwonlost]=useState(      [
           { name: "Jan", Won: 400, Lost: 240 },
           { name: "Feb", Won: 300, Lost: 139 },
           { name: "Mar", Won: 200, Lost: 980 },
           { name: "Apr", Won: 278, Lost: 390 },
      ])

//functions
//stop at the current date time and 

  const getpidata=async()=>{
 
     const d=await axios.post(  `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/PieData`,{
        userid:userid
     })
     setPieData(d.data.data)
  }

  const getreqwon=async()=>{

const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/reqwondata`,{
    interval:internval?internval:"day",
})

    setreqwon(d.data.data)
  }

  const getwonlost=()=>{
    
  }


  //useeffects
   //get userid
     useEffect(() => {
      
        if (typeof window !== "undefined") {
          const id = localStorage.getItem("tempcred");
          setuserid(id);
        }
      }, []);

  useEffect(()=>{
    console.log(internval)
    if(userid!=""){

    getpidata()
    getreqwon()}
  },[userid,internval])


  return (
    <div className="w-full h-[76vh] flex gap-4">
      <div className="w-[35%] h-full p-0  rounded-2xl flex justify-center items-center">
        {pieData&&pieData.length>0&&<PieChart width={400} height={400}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label
            outerRadius={100}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>}
      </div>

      <div className="w-[65%] h-full bg-white rounded-2xl overflow-y-auto p-4 py-9 text-center">
      <h1 className=" text-lg font-bold mb-3 text-black">Request vs Won Deals</h1>
        <div className="mb-6">
        { reqwon&& reqwon.length>0&&  <LineChart width={550} height={300} data={reqwon}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Won" stroke="#82ca9d" />
            <Line type="monotone" dataKey="Request" stroke="#8884d8" />
          </LineChart>}
        </div>
        <div className="mb-6">
                  <h1 className=" text-lg font-bold mb-3 text-black">Won vs lost</h1>
        {wonlost&&wonlost.length>0&&  <LineChart width={550} height={300} data={wonlost}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Won" stroke="#ff7300" />
            <Line type="monotone" dataKey="Lost" stroke="#387908" />
          </LineChart>}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
