
"use client";
import React from 'react'
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Flag } from "lucide-react";
type Props = {
    Newopen:boolean,
    setNewopen:React.Dispatch<React.SetStateAction<boolean>>
}

const NewSup = (props: Props) => {
  return (
    <Dialog open={props.Newopen} onOpenChange={() => props.setNewopen(false)}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-90 z-50">
            <DialogHeader>
              <DialogTitle className="w-full text-center text-2xl">
                Add Supplier
              </DialogTitle>
            </DialogHeader>

    
<div className="flex flex-col gap-4 mt-4">
  {/* Drag & Drop Box */}
  <div
    className="w-full h-[150px] border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
    onClick={() => document.getElementById('fileInput')?.click()}
  >
    <input
      id="fileInput"
      type="file"
      accept=".png,.jpg"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          alert(`Selected file: ${file.name}`); // TEMP — replace with your logic
        }
      }}
    />
    <p className="text-gray-600 text-sm">Drag & drop image here or click to select</p>
    <p className="text-gray-400 text-xs mt-1">(Only PNG and JPG files)</p>
  </div>

  {/* Input Fields */}
  <input
    type="text"
    placeholder="Supplier Name"
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
  />
  <input
    type="text"
    placeholder="Number"
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
  />
  <input
    type="email"
    placeholder="Email"
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
  />
  <input
    type="text"
    placeholder="Website"
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
  />

  {/* Dropdown */}
  <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400">
    <option value="">Select Brand</option>
    <option value="Brand A">Brand A</option>
    <option value="Brand B">Brand B</option>
    <option value="Brand C">Brand C</option>
    <option value="Brand D">Brand D</option>
  </select>

  {/* Buttons */}
  <div className="flex justify-between mt-4">
    <Button className="bg-[#454545] text-white w-[48%] rounded-lg hover:bg-[#333333]">
      Add Supplier
    </Button>
    <Button variant="outline" className="w-[48%] flex items-center gap-2 rounded-lg">
      <X size={16} />
      Back
    </Button>
  </div>
</div>


    
          </DialogContent>
        </DialogPortal>
      </Dialog>

  )
}

export default NewSup