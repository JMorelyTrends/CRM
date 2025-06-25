import React, { useEffect } from 'react';
import Select from "react-select";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/Resellerstore';
import axios from 'axios';
type selector={
    selectedBrands:string[],
    setSelectedBrands:React.Dispatch<React.SetStateAction<string[]>>
}

const BrandSelector = ({selectedBrands,setSelectedBrands}:selector) => {

  const userid=useSelector((state:RootState)=>state.Main.userid)

  useEffect(()=>{
      getbrands()
  },[userid])

  const getbrands=async()=>{
    const b=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/getBrands`, {
      userid
    })
    console.log("Brands:",b.data.data)
  }

  const brands: string[] = [
    "Air Jordan",
    "Alexander McQueen",
    "Amiri",
    "Asics",
    "Bottega Veneta",
    "Burberry",
    "Canada Goose",
    "Casablanca",
    "Chrome Hearts",
    "Cartier",
    "Chanel",
    "Christian Louboutin",
    "Coach",
    "CP Company",
    "Denim Tears",
    "Dior",
    "Fendi",
    "Fear of God",
    "Gallery Dept",
    "Ganni",
    "Goyard",
    "Gucci",
    "Hellstar",
    "HERMES",
    "Jacquemus",
    "Loewe",
    "Louis Vuitton",
    "Miu Miu",
    "Moncler",
    "Mulberry",
    "Nike",
    "Off White",
    "Prada",
    "Rhude",
    "Saint Laurent",
    "Sp5der",
    "Stone Island",
    "Supreme",
    "UGG"
  ];


  // Convert brands to react-select options
  const brandOptions = brands.map((brand) => ({
    value: brand,
    label: brand,
  }));

  // Convert selected brands to react-select format
  const selectedOptions = selectedBrands.map((brand) => ({
    value: brand,
    label: brand,
  }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium">Select Brands</label>
      <Select
        isMulti
        options={brandOptions}
        value={selectedOptions}
        onChange={(selected) => {
          setSelectedBrands(selected ? selected.map(option => option.value) : []);
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Search and select brands..."
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default BrandSelector;
