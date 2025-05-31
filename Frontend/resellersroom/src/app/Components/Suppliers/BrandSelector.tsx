import React from 'react';

type selector={
    isOpen:boolean,
    setIsOpen:React.Dispatch<React.SetStateAction<boolean>>,
    selectedBrands:string[],
    setSelectedBrands:React.Dispatch<React.SetStateAction<string[]>>
}

const BrandSelector = ({isOpen,setIsOpen,selectedBrands,setSelectedBrands}:selector) => {


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

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands((prev) => prev.filter((b) => b !== brand));
    } else {
      setSelectedBrands((prev) => [...prev, brand]);
    }
  };

  return (
    <div className="relative w-full">
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white overflow-hidden flex-nowrap"
      >
        <div className="">
            Add Brands
        </div>
      
        <svg
          className={`w-4 h-4 ml-2 transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
          {brands.map((brand, index) => (
            <label
              key={index}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              {brand}
            </label>
          ))}
        </div>
      )}

    
    </div>
  );
};

export default BrandSelector;
