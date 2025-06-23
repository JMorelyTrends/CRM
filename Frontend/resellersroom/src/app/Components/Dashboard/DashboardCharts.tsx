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

import {  DateRange } from "react-day-picker";
import { Dashstats } from "../Small comps/Types";
const COLORS =["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6699"];



const DashboardCharts = ({internval,range,setotherdetails}:{internval:string,range:DateRange|undefined,setotherdetails:React.Dispatch<React.SetStateAction<Dashstats>>}) => {
   

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



const getpidata = async () => {
  try {
    let response;

    if (range && range.from === range.to) {
      // Same day selected
      response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/PieData`, {
        internval: internval ? internval : "today",
        userid: userid,
      });
    } else if (range) {
      // Custom date range selected
      response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/PieData`, {
        startdate: range.from,
        enddate: range.to,
        userid: userid,
      });
    } else {
      // Default fallback (e.g. whole year)
      response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/PieData`, {
        internval: internval ? internval : "year",
        userid: userid,
      });
    }
    console.log(response.data.data)
    setPieData(response.data.data);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
  }
};


  const getreqwon=async()=>{
    if(range &&range?.from===range?.to)
    {
        const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/reqwondata`,{
        interval:internval?internval:"today",
         userid:userid
    })
      setreqwon(d.data.data)
    }
    else if(range){
    const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/reqwondata`,{
       startdate:range.from,
       enddate:range.to,
        userid:userid
    })
      setreqwon(d.data.data)
    }
    else{
 const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/reqwondata`,{
        interval:internval?internval:"year",
         userid:userid
    })
    console.log(d.data.data)
      setreqwon(d.data.data)
    }
  
  }

  const getwonlost=async()=>{
     if(range &&range?.from===range?.to)
    {
        const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/wonloastdata`,{
        interval:internval?internval:"today",
         userid:userid
    })
      setwonlost(d.data.data)
    }
    else if(range){
    const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/wonloastdata`,{
       startdate:range.from,
       enddate:range.to,
        userid:userid
    })
      setwonlost(d.data.data)
    }
    else{
 const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/wonloastdata`,{
        interval:internval?internval:"year",
         userid:userid
    })
      setwonlost(d.data.data)
    }
  }

  const otherdetail=async()=>{
     if(range &&range?.from===range?.to)
    {
        const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/otherdetails`,{
        interval:internval?internval:"today",
         userid:userid
    })
      setotherdetails(d.data.data)
    }
    else if(range){
    const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/otherdetails`,{
       startdate:range.from,
       enddate:range.to,
        userid:userid
    })
      setotherdetails(d.data.data)
    }
    else{
     const d=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/otherdetails`,{
        internval:internval?internval:"year",
         userid:userid
    })
       setotherdetails(d.data.data)
    }
  }


  
     useEffect(() => {
      
        if (typeof window !== "undefined") {
          const id = localStorage.getItem("tempcred");
          setuserid(id);
        }
      }, []);

  useEffect(()=>{
  
    if(userid!=""){
 
    getpidata()
    getreqwon()
    getwonlost()
    otherdetail()
  }
  },[userid,internval,range])


  return (
    <div className="w-full h-[76vh] flex gap-4">
      <div className="w-[35%] h-full p-2 rounded-2xl flex flex-col justify-center items-center overflow-auto bg-white shadow-md">
        <h1 className="text-sm font-bold mb-2 text-black">Order Distribution</h1>
        {pieData && pieData.length > 0 && (
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
            
              outerRadius={90}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
           
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{
                paddingLeft: '10px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        )}
      </div>

      <div className="w-[65%] h-full bg-white rounded-2xl overflow-y-auto p-4 py-9 text-center">
      <h1 className=" text-lg font-bold mb-3 text-black">Requests vs Won Deals</h1>
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
                  <h1 className=" text-lg font-bold mb-3 text-black">Won vs lost Deals</h1>
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