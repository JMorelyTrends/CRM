"use client";
import React, { useEffect, useState } from "react";

import NewSup from "../Components/Suppliers/NewSup";
import axios from "axios";
import { Sup } from "../Components/Small comps/Types"
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AddselectedSup } from "@/lib/features/Supplier/SupplierSlice";
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import FilterSort from "../Components/fillters/FilterSort";

type pageProps = object;

type hprops = {
  search: string;
  setsearch: React.Dispatch<React.SetStateAction<string>>;
};

function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isSmallScreen;
}
const Header = (props: hprops) => {
  return (
    <>
      <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white  sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-[40px] h-[40px]">
            <img src="/images/supplier.png" className=" w-full h-full" />
          </div>
          <h1 className=" text-3xl font-semibold text-[#888888] dark:text-[#888888]">
            Supplier CRM
          </h1>
        </div>

        <input
          type="text"
          value={props.search}
          onChange={(e) => {
            props.setsearch(e.target.value);
          }}
          placeholder="Search by Supplier "
          className="w-full lg:w-54 px-4 py-2 border-2 text-xs p-4 text-black border-gray-300 rounded-lg "
        />
      </div>
    </>
  );
};

const Page: React.FC<pageProps> = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const showBrandDropdown = true;
  const [suppliers, setsuppliers] = useState<Sup[]>();
  const [userid, setuserid] = useState<string | null>("");
  const [search, setsearch] = useState<string>("");
  const [Newopen, setNewopen] = useState<boolean>(false);
  const isSmallScreen = useIsSmallScreen();
  const [sortBy, setSortBy] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [Brands,setbrands]=useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const filterOptions = [
    { label: "Has Email", value: "hasEmail" },
    { label: "Has Website", value: "hasWebsite" },
    { label: "Has Phone", value: "hasPhone" },
    { label: "Has Brands", value: "hasBrands" },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "nameAsc" },
    { label: "Name (Z-A)", value: "nameDesc" },
    { label: "Most Brands", value: "mostBrands" },
    { label: "Least Brands", value: "leastBrands" },
  ];

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  //useffects

  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("tempcred");
      setuserid(id);
    }
  }, []);

  useEffect(() => {
    if (userid !== "") {
      getallsups();
    }
  }, [userid]);

  //functions

  const getallsups = async () => {
    const all = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`,
      { userid }
    );
    
    setsuppliers(all.data.supps);
    const b=await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Brands/getBrands`,{
      userid
    })
    let brandList = b.data.data;
    if (Array.isArray(brandList) && brandList.length > 0 && typeof brandList[0] === 'object') {
      brandList = brandList.map((brand: any) => brand.name || brand.label || brand.value || "");
    }
    setbrands(brandList)
  };

  const fillterdata = suppliers?.filter((data: Sup) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      data.Name?.toLowerCase().includes(searchTerm) ||
      data.Email?.toLowerCase().includes(searchTerm) ||
      data.Number?.toLowerCase().includes(searchTerm) ||
      data.Website?.toLowerCase().includes(searchTerm) ||
      data.Brand?.some((b: string) => b.toLowerCase().includes(searchTerm));

    const matchesFilters = activeFilters.every(filter => {
      switch (filter) {
        case "hasEmail":
          return !!data.Email;
        case "hasWebsite":
          return !!data.Website;
        case "hasPhone":
          return !!data.Number;
        case "hasBrands":
          return data.Brand && data.Brand.length > 0;
        default:
          return true;
      }
    });

    const matchesBrand = !selectedBrand || (data.Brand && data.Brand.includes(selectedBrand));

    return matchesSearch && matchesFilters && matchesBrand;
  });

  const sortedData = fillterdata?.sort((a, b) => {
    switch (sortBy) {
      case "nameAsc":
        return (a.Name || "").localeCompare(b.Name || "");
      case "nameDesc":
        return (b.Name || "").localeCompare(a.Name || "");
      case "mostBrands":
        return (b.Brand?.length || 0) - (a.Brand?.length || 0);
      case "leastBrands":
        return (a.Brand?.length || 0) - (b.Brand?.length || 0);
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="w-[80vw] h-[100vh]  flex flex-col">
        {/**popups */}

        <NewSup
          Newopen={Newopen}
          setNewopen={setNewopen}
          getallsups={getallsups}
        />

        {/**Header */}
        {!isSmallScreen && <Header search={search} setsearch={setsearch} />}

        {/*ADD new Supplier */}
        <div className="w-full h-[8vh] mt-[2vh] bg-white flex justify-items-start items-end">
          <button
            className="lg:w-[25%]  h-full ml-5 bg-[#454545] text-white font-bold rounded-2xl cursor-pointer hover:border-black"
            onClick={() => {
              setNewopen(true);
            }}
          >
            Add New Supplier
          </button>
        </div>

        {/*Filters and Sort */}
        <FilterSort
          title="All Suppliers"
          count={suppliers?.length}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          brandOptions={Brands}
          onBrandChange={setSelectedBrand}
          showBrandDropdown={showBrandDropdown}
        />

        {/* Cards Container */}
        <div
          className="w-full h-[65vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-col-4 gap-4 p-4 
           [&::-webkit-scrollbar]:w-1
           [&::-webkit-scrollbar-track]:bg-gray-100
           [&::-webkit-scrollbar-thumb]:bg-black
           dark:[&::-webkit-scrollbar-track]:bg-neutral-700
           dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
          {suppliers &&
            suppliers.length > 0 &&
            sortedData &&
            sortedData.length > 0 &&
            sortedData.map((data: Sup, index: number) => {
              return (
                <div
                  key={index}
                  onClick={() => {
                    dispatch(AddselectedSup(data));
                    router.push("/SupplierCRM/Edit");
                  }}
                  className="relative w-full h-[220px] bg-white rounded-lg flex flex-col p-4 text-black shadow hover:shadow-lg transition cursor-pointer hover:bg-gray-50"
                >
                  {/* Upper Half */}
                  <div className="w-full h-[70%] flex gap-4">
                    {/* Image */}
                    <div className="w-1/2 h-full flex items-center justify-center">
                      <img
                        src={data.image ?? "/images/Logo.png"}
                        alt="Supplier"
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>

                    {/* Details */}
                    <div className="w-1/2 flex flex-col justify-start gap-2 text-lg font-semibold">
                      <p className="font-bold text-2xl truncate">{data.Name}</p>
                      {data.Email && (
                        <p className="text-xs text-[#4774B1] truncate">
                          {data.Email}
                        </p>
                      )}
                      {data.Number && (
                        <p className="text-xs text-[#4774B1] truncate">
                          {data.Number}
                        </p>
                      )}
                      {data.Website && (
                        <p className="text-xs text-[#4774B1] truncate">
                          {data.Website}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Brand Capsules */}
                  {data.Brand && data.Brand.length > 0 && (
                    <div className="w-full flex flex-wrap gap-2 mt-2">
                      {data.Brand.slice(0, 2).map((b, index) => (
                        <div
                          key={index}
                          className="bg-gray-300 text-xs px-3 py-1 rounded-full text-black font-medium"
                        >
                          {b}
                        </div>
                      ))}
                      {data.Brand.length > 3 && (
                        <div className="bg-gray-300 text-xs px-3 py-1 rounded-full text-black font-medium">
                          ...more
                        </div>
                      )}
                    </div>
                  )}

                  {/* WhatsApp Logo */}
                  <div className="absolute bottom-4 right-4">
                    {data.Number && (
                      <a 
                        href={`https://wa.me/${data.Number.replace(/[^0-9]/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-green-600 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
        
      </div>
    </>
  );

};
export default Page;
