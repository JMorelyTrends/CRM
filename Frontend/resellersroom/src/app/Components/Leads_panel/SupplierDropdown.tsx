import React from "react";
import Select from "react-select";
import { Supplier } from "../Small comps/Types";
import NewSup from "../Suppliers/NewSup";

export default function SupplierDropdown({
  availsuppliers,
  supplierUsed,
  setSupplierUsed,
  getsuppliers,
}: {
  availsuppliers: Supplier[] | null;
  supplierUsed: string;
  setSupplierUsed: React.Dispatch<React.SetStateAction<string>>;
  getsuppliers: React.Dispatch<React.SetStateAction<void>>;
}) {
  const [Newopen, setNewopen] = React.useState<boolean>(false);

  // Convert your suppliers to react-select options
  const supplierOptions =
    availsuppliers?.map((supplier) => ({
      value: supplier._id,
      label: supplier.Name || "Unnamed Supplier",
    })) || [];

  // Find the currently selected supplier
  const selectedOption = supplierOptions.find(
    (option) => option.value === supplierUsed
  ) || null;

  return (
    <div className="mb-4">
      <NewSup
        Newopen={Newopen}
        setNewopen={setNewopen}
        getallsups={getsuppliers}
      />
      <label className="block text-sm font-medium">Supplier Used</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1">
          <Select
            options={supplierOptions}
            value={selectedOption}
            onChange={(option) => {
              setSupplierUsed(option ? option.value : "");
            }}
            isClearable
            placeholder="Search  supplier"
            className="react-select-container"
            classNamePrefix="react-select"
         
          />
        </div>

        <button
          type="button"
          className="mt-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-600"
          onClick={() => {
            setNewopen(true);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
