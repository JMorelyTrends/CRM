// components/DealDialog.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { labeltype,Supplier } from "../Small comps/Types";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Toggleleadsrenderstep } from "@/lib/features/Newrequest/NewRequestSlice";
import { RootState } from "@/lib/Resellerstore";

import SupplierDropdown from "./SupplierDropdown";

//--------------import popups----------------------------------------//
import { ToogleCompleteorder } from "@/lib/features/OrederReview/OrderReviewSlice";
import AddPaymentPopup from "./Addpaymentpopup";
import AddSourceOfTruthPopup from "./Addsourceoftruthpopup";



// Custom debounce function
function useDebounce<A>(callback: (arg: A) => void, delay: number) {
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (arg: A) => {
      if (timeoutRef) clearTimeout(timeoutRef);

      const timeout = setTimeout(() => {
        callback(arg);
      }, delay);

      setTimeoutRef(timeout);
    },
    [callback, delay, timeoutRef]
  );
}

interface AddressSuggestion {
  address: string;
  city: string;
  country: string;
  postcode: string;
}

export function CompleteOrderPopup({
  open,
  setOpen,
  // task,
  fetchallorders,
  update,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // task: Task;
  fetchallorders: () => void;
  update: boolean
}) {

  const dispatch = useDispatch()
  const task = useSelector((state: RootState) => state.Rew.currentorder)
  const isOpen = useSelector((state: RootState) => state.Rew.completeorder);
  const [productName, setProductName] = useState(task?.Name ?? '');
  const [size, setSize] = useState(task?.size ?? '');
  const [costPrice, setCostPrice] = useState<string>(task?.stockxitem?.[0]?.last_sale_price?.toString() ?? task?.items?.[0]?.price?.toString() ?? '');
  const [shippingFee, setShippingFee] = useState<string>(task?.Shippingfee ?? '');
  const [processingFee, setProcessingFee] = useState<string>(task?.processingfee ?? '');
  const [supplierUsed, setSupplierUsed] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>(task?.shippingaddress ?? '');
  const [shippingAddressObj, setShippingAddressObj] = useState<{
    address1: string;
    city: string;
    postcode: string;
    country: string;
  } | null>(null);
  const [dealOwner, setDealOwner] = useState<string>(task?.DealOwner ?? '');
  const [sourceOfTruth, setSourceOfTruth] = useState<string>(task?.Sourceofthruth ?? '');
  const [paymentMethod, setPaymentMethod] = useState<string>(task?.paymentmethod ?? '');
  const [sell, setsell] = useState<string>(task?.sellprice?.toString() ?? '')

  //usestates for feautres
  const [selectedLabels, setSelectedLabels] = useState<labeltype[]>(task?.labels ?? []);
  const [LabelDialogOpen, setLabelDialogOpen] = useState<boolean>(false)
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [availableLabels, setavailableLabels] = useState<labeltype[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [availsuppliers, setavailsuppliers] = useState<Supplier[]>()
  const [paymentmethods, setpaymentmethods] = useState<string[]>()
  const [sources, setsources] = useState<string[]>()
  const router = useRouter()

  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [addressFields, setAddressFields] = useState({
    address: '',
    city: '',
    postcode: '',
    country: ''
  });
  //--------------states that are controlling popups--------------------//
  const [showSeparateFields, setShowSeparateFields] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sourceopen,setsourceopen]=useState<boolean>(false)
  const [brandopen,setbrandopen]=useState<boolean>(false)
  const [paymentPopupOpen, setPaymentPopupOpen] = useState<boolean>(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState<boolean>(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const paymentButtonRef = useRef<HTMLButtonElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const sourceButtonRef = useRef<HTMLButtonElement>(null);

  //------------here i am getting uerid front he redux which will get chagned once we start working on the multiple users-------------//
  const userid = useSelector((state: RootState) => state.Main.userid);



  // Hide dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addressDropdownRef, textareaRef]);

  useEffect(() => {
    dispatch(Toggleleadsrenderstep(0));
  }, [dispatch]);

  useEffect(() => {
    if (userid !== "" && userid) {

      getsuppliers();
    }
 
  }, [userid])

  useEffect(() => {
    if (open && task) {
      setProductName(task.Name);
      setSize(task.size);
      if (task.price == 0) {
        setCostPrice(task.stockxitem?.[0]?.last_sale_price?.toString() || task.items?.[0]?.price.toString() || '');
      }
      else {
        setCostPrice(task.price ? task.price?.toString() : "undefined")
      }

      let p=Number(task?.processingfee);
      let s=Number(task?.sellprice);
      let k=((p/s)*100).toFixed(2).toString();

      setShippingFee(task.Shippingfee ? task.Shippingfee : '');
      setProcessingFee(k || '');
      setSupplierUsed((task.Supplierid && task.Supplierid?._id) ? task.Supplierid._id : '');
      setShippingAddress(task.shippingaddress ? task.shippingaddress : '');
      setDealOwner(task.DealOwner ? task.DealOwner : '');
      setSourceOfTruth(task.Sourceofthruth ? task.Sourceofthruth : '');
      setPaymentMethod(task.paymentmethod ? task.paymentmethod : '');
      setSelectedLabels(task.labels ?? []);
      setsell(task.sellprice ? task.sellprice.toString() : '')
    }

  }, [task, open]);


  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const userid = localStorage.getItem("tempcred");
        if (!userid) return;

        const availtags = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`,
          {
            id: userid,
          }
        );

        setavailableLabels(availtags.data.data || []);
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };

    fetchLabels();
  }, [createLabelOpen, LabelDialogOpen]);

  // Dropdown open/close logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        paymentDropdownOpen &&
        paymentDropdownRef.current &&
        !paymentDropdownRef.current.contains(event.target as Node) &&
        paymentButtonRef.current &&
        !paymentButtonRef.current.contains(event.target as Node)
      ) {
        setPaymentDropdownOpen(false);
      }
      if (
        sourceopen &&
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(event.target as Node) &&
        sourceButtonRef.current &&
        !sourceButtonRef.current.contains(event.target as Node)
      ) {
        setsourceopen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [paymentDropdownOpen, sourceopen]);



  // Address search function
  const searchAddress = async (searchText: string) => {
    if (searchText.length < 2) {
      setAddressSuggestions([]);
      return;
    }
    setIsLoadingAddress(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getaddress`, {
        searchText
      });
      if (response.data.success) {
        setAddressSuggestions(response.data.suggestions);
        setShowAddressDropdown(true);
      }
    } catch {
      toast.error("Error fetching address suggestions");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebounce<string>((searchText) => { void searchAddress(searchText); }, 500);

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setShippingAddress(value);
    setSelectedAddress(null);
    setShowSeparateFields(false);
    debouncedSearch(value);
  };

  // Handle address selection (no details API needed)
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddressFields({
      address: suggestion.address,
      city: suggestion.city,
      postcode: suggestion.postcode,
      country: suggestion.country
    });
    setShippingAddress(suggestion.address);
    setShippingAddressObj({
      address1: suggestion.address,
      city: suggestion.city,
      postcode: suggestion.postcode,
      country: suggestion.country
    });
    setSelectedAddress(suggestion);
    setShowAddressDropdown(false);
    setShowSeparateFields(true);
  };

  // Clear selected address
  const clearSelectedAddress = () => {
    setShippingAddress('');
    setAddressFields({
      address: '',
      city: '',
      postcode: '',
      country: ''
    });
    setSelectedAddress(null);
    setShowAddressDropdown(false);
    setShowSeparateFields(false);
  };

  // Handle individual field changes
  const handleFieldChange = (field: string, value: string) => {
    setAddressFields(prev => ({
      ...prev,
      [field]: value
    }));
    setShippingAddressObj(prev => ({
      ...prev!,
      [field === 'address' ? 'address1' : field]: value
    }));
  };

  // Show dropdown when textarea is focused
  const handleTextareaFocus = () => {
    if (addressSuggestions.length > 0 && !selectedAddress) {
      setShowAddressDropdown(true);
    }
  };

  //------------------------get all suppliers payment methods Brands anad sources of truths
  const getsuppliers = async () => {
    try {

      const [sup, pay, sou] = await Promise.all([
        axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`, {
          userid
        }),
        axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/getpaymentmethods`, {
          userid
        }),
        axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/getsources`, {
          userid
        })
      ])
   
      setsources(sou.data.data)
      setpaymentmethods(pay.data.data)
      setavailsuppliers(sup.data.supps)
    }
    catch {
      toast.error("something wrong when fetching suppliers")
    }
  }


  //--------------------labels funcitons----------------------------///
  const AddnewLabel = async (color: string, label: string) => {
    try {
      const userid = localStorage.getItem("tempcred");
      if (!userid) return;

      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/addlabel`,
        {
          color,
          name: label,
          userid,
        }
      );

      setCreateLabelOpen(false);
      const availtags = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/getlabels`,
        {
          id: userid,
        }
      );

      setavailableLabels(availtags.data.data || []);
      setLabelDialogOpen(true);
    } catch (err) {
      console.error("Failed to add label", err);
    }
  };

  const Labeltoggle = async (label: labeltype) => {
    if (!task?._id) return;
   
   
    
    const isAlreadySelected = selectedLabels.some((l) => l._id === label._id);
    const updatedLabels = isAlreadySelected
      ? selectedLabels.filter((l) => l._id !== label._id)
      : [...selectedLabels, label];

    setSelectedLabels(updatedLabels);

    try {
      const cleanlabel = updatedLabels.map(({ _id }) => _id);;
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/updatelabels`, {
        newlabels: cleanlabel,
        orderid: task._id
      });

      fetchallorders();
    } catch (err) {
      console.error("Failed to update labels", err);
    }
  };


  //-----------------label function ends-------------------------------//



  const handleDeleteLabel = async (id: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/features/dellabel`, {
        id: id
      })
      setavailableLabels(availableLabels.filter((label: labeltype) => id !== label._id))

    }
    catch {
      console.log("error deleting label")
    }
  }
  // Delete payment method
  const handleDeletePaymentMethod = async (method: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/deleteaddpaymentmethod`, {
        data: { name: method }
      });

      toast.success("Payment method deleted");
      const pay = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/getpaymentmethods`, {
        userid
      })
    
      setpaymentmethods([...pay.data.data])
      // If the deleted method was selected, clear selection
      if (paymentMethod === method) setPaymentMethod("");
    } catch {
      toast.error("Failed to delete payment method");
    }
  };




  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-400",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-gray-500",
    "bg-zinc-500",
    "bg-neutral-500",
    "bg-stone-500",
    "bg-blue-400",
    "bg-green-400",
    "bg-red-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-yellow-300",
    "bg-orange-400",
    "bg-teal-400",
    "bg-indigo-400",
  ];

  const Orderreview = () => {

    router.push('/Leads/OrderReview')
  }

  const Submit = async () => {
    if (productName && size && costPrice && shippingFee && processingFee && supplierUsed && selectedAddress && dealOwner && sourceOfTruth && paymentMethod) {
      setIsSubmitting(true);
      const p= (Number(processingFee)/100)
      const s=Number(sell)
      const pro=p*s;
      const fee=pro.toString()
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/Confrimorder`,
          {
            _id: task?._id,
            price: costPrice,
            sell: sell,
            Name: productName,
            size: size,
            Supplierid: supplierUsed,
            Shippingfee: shippingFee,
            processingfee: fee,
            shippingaddress: shippingAddressObj,
            Sourceofthruth: sourceOfTruth,
            paymentmethod: paymentMethod,
            DealOwner: dealOwner,
          }
        );
        await fetchallorders();
        toast.success("order updated");
        setOpen(false);
        dispatch(ToogleCompleteorder());
        if (update == false) {
          router.push('/Leads/OrderReview');
        }
      } catch  {
        toast.error("Failed to update order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
    else {
      toast("Fill all fields");
    }
  }

  // Add the handleDeleteSource function
  const handleDeleteSource = async (source: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/deletesource`, {
        data: { name: source }
      });
      toast.success("Source deleted");
      await getsuppliers();
      if (sourceOfTruth === source) setSourceOfTruth("");
    } catch {
      toast.error("Failed to delete source");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {
        if (!isSubmitting) {
          dispatch(ToogleCompleteorder());
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader className="text-center flex justify-center items-center">
            <DialogTitle>Complete Order Details</DialogTitle>
          </DialogHeader>

          {/* Image + Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className=" w-[40%] h-full"> <img
              src={task?.stockxitem?.[0]?.image ?? task?.items?.[0]?.itempics?.[0] ?? '/placeholder.jpg'}
              alt={task?.Name ?? ''}
              className="w-[150px] h-[150px] object-contain rounded "
            />
            </div>
            <div className="  w-[60%] h-full flex gap-4   flex-col justify-center items-center text-center">
              <div className="text-lg font-semibold text-wrap">{task?.stockxitem?.[0]?.name} </div>
              <div className="text-lg font-semibold">{task?.Name} </div>
              <div className="text-sm font-semibold text-[#4774B1]">{task?.email}</div>
              <div className="text-sm font-semibold text-[#4774B1]">{task?.phone}</div>
            </div>

          </div>

          {/* Inputs in 2 balanced columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Confirm Customer Name</label>
                <input type="text" className="w-full border rounded px-3 py-2 mt-1"
                  value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm Size</label>
                <input type="text" className="w-full border rounded px-3 py-2 mt-1"
                  value={size} onChange={(e) => setSize(e.target.value)} />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium">Sell Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2  transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2 mt-1"
                    value={sell}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setsell(val);
                      }
                    }}
                  />
                </div>
              </div>


              <div className="relative">
                <label className="block text-sm font-medium">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2 mt-1"
                    value={costPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setCostPrice(val);
                      }
                    }}
                  />
                </div>
              </div>

  {
    availsuppliers &&  <SupplierDropdown availsuppliers={availsuppliers}  supplierUsed={supplierUsed} setSupplierUsed={setSupplierUsed} getsuppliers={getsuppliers} />
  }
{/* <div>
  <label className="block text-sm font-medium">Supplier Used</label>
  <select
    className="w-full border rounded px-3 py-2 mt-1"
    value={supplierUsed}
    onChange={(e) => setSupplierUsed(e.target.value)}
  >
    <option value="">Select Supplier</option>
    {availsuppliers&&availsuppliers?.map((supplier) => (
      <option key={supplier._id} value={supplier._id}>
        {supplier.Name || "Unnamed Supplier"}
      </option>
    ))}
  </select>
</div> */}
    <div>
      <label className="block text-sm font-medium">Deal Owner</label>
      <select className="w-full border rounded px-3 py-2 mt-1"
        value={dealOwner} onChange={(e) => setDealOwner(e.target.value)}>
        <option value="">Select Deal Owner</option>
        <option value="Owner A">ALFIE</option>
        <option value="Owner B">FRAN</option>
      
      </select>
    </div>
  </div>

            <div className="space-y-5 ">
              <div className="relative">
                <label className="block text-sm font-medium">Shipping Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2 mt-1"
                    value={shippingFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setShippingFee(val);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium">Processing Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  <input
                    type="text"
                    className="w-full border rounded px-8 py-2 mt-1"
                    value={processingFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setProcessingFee(val);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium">Confirm Shipping Address</label>
                <div className="relative">
                  {!showSeparateFields ? (
                    <>
                      <textarea
                        ref={textareaRef}
                        rows={3}
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={shippingAddress}
                        onChange={handleAddressChange}
                        onFocus={handleTextareaFocus}
                        placeholder="Start typing an address..."
                      />
                      {/* Address Suggestions Dropdown */}
                      {showAddressDropdown && addressSuggestions.length > 0 && !selectedAddress && (
                        <div ref={addressDropdownRef} className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                              onClick={() => handleAddressSelect(suggestion)}
                            >
                              <MapPin size={16} className="text-gray-400" />
                              <div className="text-sm">
                                <div className="font-medium">{suggestion.address}</div>
                                <div className="text-gray-500">
                                  {[suggestion.city, suggestion.postcode]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium">Address</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-1"
                          value={addressFields.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">City</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-1"
                          value={addressFields.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Postcode</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-1"
                          value={addressFields.postcode}
                          onChange={(e) => handleFieldChange('postcode', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Country</label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 mt-1"
                          value={addressFields.country}
                          onChange={(e) => handleFieldChange('country', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={clearSelectedAddress}
                        className="w-full"
                      >
                        Clear Address
                      </Button>
                    </div>
                  )}
                </div>

                {isLoadingAddress && (
                  <div className="absolute right-3 top-10">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Source of Truth</label>
                <div className="flex gap-2 items-center relative">
                  <button
                    ref={sourceButtonRef}
                    type="button"
                    className="w-full border rounded px-3 py-2 mt-1 flex justify-between items-center bg-white"
                    onClick={() => {
                      setsourceopen((prev) => {
                        if (!prev) setPaymentDropdownOpen(false); // close other dropdown
                        return !prev;
                      });
                    }}
                  >
                    <span>{sourceOfTruth || "Select Source"}</span>
                    <ChevronDown size={16} />
                  </button>
                  <Button type="button" size="icon" variant="outline" className="mt-1" onClick={() => setbrandopen(true)}>
                    <Plus size={16} />
                  </Button>
                  {sourceopen && (
                    <div ref={sourceDropdownRef} className="absolute z-50 left-0 top-full mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                      {sources && sources.length > 0 ? (
                        sources.map((source) => (
                          <div key={source} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            <span
                              className="flex-1 text-left"
                              onClick={() => {
                                setSourceOfTruth(source);
                                setsourceopen(false);
                              }}
                            >
                              {source}
                            </span>
                            <button
                              className="ml-2 text-gray-400 hover:text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteSource(source);
                              }}
                              title="Delete"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400">No sources available</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm Payment Method</label>
                <div className="flex gap-2 items-center relative">
                  <button
                    ref={paymentButtonRef}
                    type="button"
                    className="w-full border rounded px-3 py-2 mt-1 flex justify-between items-center bg-white"
                    onClick={() => {
                      setPaymentDropdownOpen((prev) => {
                        if (!prev) setsourceopen(false); // close other dropdown
                        return !prev;
                      });
                    }}
                  >
                    <span>{paymentMethod || "Select  Method"}</span>
                    <ChevronDown size={16} />
                  </button>
                  <Button type="button" size="icon" variant="outline" className="mt-1" onClick={() => setPaymentPopupOpen(true)}>
                    <Plus size={16} />
                  </Button>
                  {paymentDropdownOpen && (
                    <div ref={paymentDropdownRef} className="absolute z-50 left-0 top-full mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                      {paymentmethods && paymentmethods.length > 0 ? (
                        paymentmethods.map((method) => (
                          <div key={method} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            <span
                              className="flex-1 text-left"
                              onClick={() => {
                                setPaymentMethod(method);
                                setPaymentDropdownOpen(false);
                              }}
                            >
                              {method}
                            </span>
                            <button
                              className="ml-2 text-gray-400 hover:text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeletePaymentMethod(method);
                              }}
                              title="Delete"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400">No payment methods</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Labels */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Labels</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedLabels?.map((label) => (
                <div
                  key={label._id}
                  className={`px-3 py-1 text-sm rounded-full text-white flex items-center gap-1 ${label.label.col}`}
                >
                  {label.label.name}
                  <button
                    onClick={() => Labeltoggle(label)}
                    className="text-white hover:text-gray-200"
                    title="Remove label"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <Button size="icon" variant="outline" onClick={() => setLabelDialogOpen(true)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          {
            update == false && (task?.confirm == false ?
              <div className="flex justify-end">
                <Button
                  onClick={() => Submit()}
                  disabled={isSubmitting}
                  className="relative"
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">Submit</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
              :
              <div className="flex justify-end">
                <Button onClick={() => Orderreview()}>Order review</Button>
              </div>)
          }
          {
            // update==true&&task&&
            // <div className="flex justify-end">
            //   <Button onClick={()=>Submit()}>Update</Button>
            // </div>
          }
        </DialogContent>
      </Dialog>

      <Dialog open={LabelDialogOpen} onOpenChange={() => setLabelDialogOpen(false)}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader>
            <DialogTitle>Select a Label</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 my-4">
            {availableLabels?.map((label) => (
              <div
                key={label._id}
                className="flex items-center justify-between gap-2 border p-2 rounded-md"
              >
                <Button
                  variant="ghost"
                  onClick={() => Labeltoggle(label)}
                  className="flex-grow justify-start gap-2"
                >
                  <span className={`w-3 h-3 rounded-full ${label.label.col}`} />
                  {label.label.name}
                  {selectedLabels?.find((l) => l._id === label._id) && (
                    <Check size={16} />
                  )}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteLabel(label._id)}
                  className="ml-2 w-5 h-5 cursor-pointer"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setLabelDialogOpen(false);
              setCreateLabelOpen(true);
            }}
          >
            Create New Label
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader>
            <DialogTitle>Create a Label</DialogTitle>
          </DialogHeader>
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Label Name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap mb-4">
            {colors.map((color) => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? "border-black" : "border-transparent"
                  } ${color}`}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <Button onClick={() => AddnewLabel(selectedColor, newLabel)}>Add</Button>
        </DialogContent>
      </Dialog>

      <AddPaymentPopup open={paymentPopupOpen} setOpen={setPaymentPopupOpen} onSuccess={getsuppliers} />
      <AddSourceOfTruthPopup open={brandopen} setOpen={setbrandopen} onSuccess={getsuppliers} />
    </>
  );

}
