import React from 'react'


const Dashboardheader = () => {
  return (
    <div className='w-full h-[10vh] flex justify-start items-center gap-3 '>
        <div className=" ml-8  h-[70%]">
            <img src="/images/Dashboard.png" alt="" className=' w-full h-full object-contain' />
        </div>
        <div className=" text-4xl text-[#888888] font-bold ">
              Dashboard
        </div>

    </div>
  )
}

export default Dashboardheader