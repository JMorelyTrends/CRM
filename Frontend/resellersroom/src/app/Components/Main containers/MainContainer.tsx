import React from 'react'
// import Requestpanle from '../Newrequest panel/Requestpanle'
type Props = {
    sideopen: boolean;
   
     ClassName: string;
}

function MainContainer(props: Props) {
  return (
    <div
    className={`
          transition-all duration-500 ease-in-out
          ${
            props.sideopen ? "lg:w-[80vw] md:w-[70vw]" : "lg:w-[100vw] md:w-[100vw]"
          }
          
          w-full relative  // Mobile always full width
           h-full ${props.ClassName}
           flex justify-center align-middle items-center
        `}
  >
    
  </div>  )
}

export default MainContainer