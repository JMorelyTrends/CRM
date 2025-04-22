import React from 'react'

type Props = object

function Sidelogo({}: Props) {
  return (
    <div className=" w-full  lg:h-[23%] md:h-[26%] h-[16%]   flex justify-center align-middle items-center">
        
        <div className="w-26 h-26 sm:w-34 sm:h-34 md:w-32 md:h-32 lg:w-30 lg:h-30 bg-[#ffff] rounded-full">
            <img src="/images/Logo.png" className=' w-full h-full bg-contain' />
        </div>

    </div>
  )
}

export default Sidelogo