import React, { useEffect, useState } from 'react';
import Select from "react-select";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/Resellerstore';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import AddBrandpopup from './AddBrandpopup';
import { X } from 'lucide-react';
import {  OptionProps } from 'react-select';

type selector = {
  selectedBrands: string[],
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>
}

const BrandSelector = ({ selectedBrands, setSelectedBrands }: selector) => {
  const userid = useSelector((state: RootState) => state.Main.userid);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const b = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/getBrands`, {
          userid
        });
        const brandList = b.data.data;
        setBrands(brandList);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, [userid]);

  const getBrands = async () => {
    try {
      const b = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/getBrands`, {
        userid
      });
      const brandList = b.data.data;
      setBrands(brandList);
    } catch {
      setBrands([]);
    }
  };

  const handleDeleteBrand = async (brand: string) => {
    setDeleting(brand);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/deleteBrands`, {
        data: { name: brand, userid }
      });
      getBrands();
      // Optionally, remove from selectedBrands if deleted
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } catch {
      // Optionally show error toast
    } finally {
      setDeleting(null);
    }
  };

  // Custom Option component for react-select
  const CustomOption = (props: OptionProps<{ value: string; label: string }, true>) => {
    const { innerProps, innerRef, data } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
      >
        <span>{data.label}</span>
        <button
          type="button"
          className="ml-2 text-red-500 hover:text-red-700 p-1"
          onClick={e => {
            e.stopPropagation();
            handleDeleteBrand(data.value);
          }}
          disabled={deleting === data.value}
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  // const brands: string[] = [
  //   "Air Jordan",
  //   "Alexander McQueen",
  //   "Amiri",
  //   "Asics",
  //   "Bottega Veneta",
  //   "Burberry",
  //   "Canada Goose",
  //   "Casablanca",
  //   "Chrome Hearts",
  //   "Cartier",
  //   "Chanel",
  //   "Christian Louboutin",
  //   "Coach",
  //   "CP Company",
  //   "Denim Tears",
  //   "Dior",
  //   "Fendi",
  //   "Fear of God",
  //   "Gallery Dept",
  //   "Ganni",
  //   "Goyard",
  //   "Gucci",
  //   "Hellstar",
  //   "HERMES",
  //   "Jacquemus",
  //   "Loewe",
  //   "Louis Vuitton",
  //   "Miu Miu",
  //   "Moncler",
  //   "Mulberry",
  //   "Nike",
  //   "Off White",
  //   "Prada",
  //   "Rhude",
  //   "Saint Laurent",
  //   "Sp5der",
  //   "Stone Island",
  //   "Supreme",
  //   "UGG"
  // ];

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
      <div className="flex items-center gap-2">
        <div className="w-[90%]">
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
            components={{ Option: CustomOption }}
          />
        </div>
        <Button size="sm" type="button" onClick={() => setAddDialogOpen(true)} aria-label="Add Brand">+</Button>
      </div>
      <AddBrandpopup open={addDialogOpen} setOpen={setAddDialogOpen} onSuccess={getBrands} />
    </div>
  );
};

export default BrandSelector;
