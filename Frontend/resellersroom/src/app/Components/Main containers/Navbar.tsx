import React from 'react'

type Props = {
    toggleSidebar:(msg:string)=>void;
}

const Navbar = (props: Props) => {
  return (
    <div
    className=' ml-4 lg:hidden  visible p-0 bg-blck w-full h-[4vh]  flex justify-start  '
    >
             <svg
             onClick={()=>props.toggleSidebar("menubtn")}
             viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fillRule="evenodd" d="M19 4a1 1 0 01-1 1H2a1 1 0 010-2h16a1 1 0 011 1zm0 6a1 1 0 01-1 1H2a1 1 0 110-2h16a1 1 0 011 1zm-1 7a1 1 0 100-2H2a1 1 0 100 2h16z"></path> </g></svg>   

    </div>
  )
}

export default Navbar