"use client";
import React from "react";
import Sidelogo from "../Small comps/Sidelogo";
import Sideoptions from "../Small comps/Sideoptions";

type Props = {
  ClassName: string;
  sideopen: boolean;
};

function Sidebar(props: Props) {
  return (
    <div
      className={`
  absolute md:absolute lg:relative
  transition-all duration-500 ease-in-out
  ${
    props.sideopen
      ? "translate-x-0 lg:w-[20vw] md:w-[40vw]"
      : "-translate-x-full md:translate-x-0 lg:w-0 md:w-0 overflow-hidden"
  }
  w-[60vw]  // Mobile width
  h-full  ${props.ClassName}
  
`}
    >
      <Sidelogo />
      <Sideoptions />
    </div>
  );
}

export default Sidebar;
