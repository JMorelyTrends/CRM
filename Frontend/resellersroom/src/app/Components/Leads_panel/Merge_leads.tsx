import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
import { Slinedata, Supplier,Custprop } from "../Small comps/Types";
import SupplierDropdown from "./SupplierDropdown";
import { RootState } from "@/lib/Resellerstore";
import { useSelector } from "react-redux";
import axios from "axios";
import { MapPin, Plus, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import AddPaymentPopup from "./Addpaymentpopup";
import AddSourceOfTruthPopup from "./Addsourceoftruthpopup";

export function MergeLeadsPopup({
  open,
  onClose,
  lineData,
  onSave,
  initialShippingFee = "0",
  initialProcessingFee = "0",
  initialSource = "",
  initialSupplier = "",
  initialCustomerName = "",
  initialEmail = "",
  initialPhone = "",
  initialImage = "",
}: {
  open: boolean;
  onClose: () => void;
  lineData: Slinedata[];
  onSave: (data: {
    shippingFee: string;
    processingFee: string;
    source: string;
    supplier: string;
    linedata: Slinedata[];
    address: any;
    dealOwner: string;
    customerName: string;
  }) => void;
  initialShippingFee?: string;
  initialProcessingFee?: string;
  initialSource?: string;
  initialSupplier?: string;
  initialCustomerName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialImage?: string;
}) {
  const userid = useSelector((state: RootState) => state.Main.userid);
  const [shippingFee, setShippingFee] = useState<string>(initialShippingFee);
  const [processingFee, setProcessingFee] = useState<string>(initialProcessingFee);
  const [source, setSource] = useState<string>(initialSource);
  const [supplier, setSupplier] = useState<string>(initialSupplier);
  const [dummyLinedata, setDummyLinedata] = useState<Slinedata[]>([]);
  const mtasks = useSelector((state: RootState) => state.Merge.Mtasks);
  const [availsuppliers, setavailsuppliers] = useState<Supplier[]>();
  const [customerName, setCustomerName] = useState<string>(initialCustomerName);
  const [email, setEmail] = useState<string>(initialEmail);
  const [phone, setPhone] = useState<string>(initialPhone);
  const [cus,setcus]=useState<null|Custprop>(null)
  const [paymentmethods, setpaymentmethods] = useState<string[]>([]);
  const [sources, setsources] = useState<string[]>([]);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState<boolean>(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState<boolean>(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);
  const paymentButtonRef = useRef<HTMLButtonElement>(null);
  const [sourceopen, setsourceopen] = useState<boolean>(false);
  const [brandopen, setbrandopen] = useState<boolean>(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const sourceButtonRef = useRef<HTMLButtonElement>(null);

  const getImage = () => {
    if (initialImage) return initialImage;
    if (dummyLinedata && dummyLinedata.length > 0) {
      return dummyLinedata[0].image || "/placeholder.jpg";
    }
    return "/placeholder.jpg";
  };


  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSeparateFields, setShowSeparateFields] = useState<boolean>(false);
  const [addressFields, setAddressFields] = useState({
    address: '',
    city: '',
    postcode: '',
    country: ''
  });
  const [shippingAddressObj, setShippingAddressObj] = useState<any | null>(null);
  const [dealOwner, setDealOwner] = useState<string>("");
  const [dealOwners, setDealOwners] = useState<{ _id: string; name: string }[]>([]);
  const [dealOwnerPopupOpen, setDealOwnerPopupOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ids,setids]=useState<string[]>()

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

  const debouncedSearch = useDebounce<string>((searchText) => { void searchAddress(searchText); }, 500);

  useEffect(() => {
    const getsuppliers = async () => {
      const k = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/supplier/getallsuppliers`, {
        userid
      });
      setavailsuppliers(k.data.supps);
      // Fetch payment methods
      const pay = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/getpaymentmethods`, { userid });
      setpaymentmethods(pay.data.data || []);
      // Fetch sources of truth
      const sou = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/getsources`, { userid });
      setsources(sou.data.data || []);
    };
    if (userid) {
      getsuppliers();
    }
  }, [userid]);

  useEffect(() => {
    const getDealOwners = async () => {
      try {
        const tea = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Team/getTeams`, { userid });
        if (Array.isArray(tea.data.data)) {
          setDealOwners(tea.data.data.map((obj: { _id: string; name: string }) => ({ _id: obj._id, name: obj.name })));
        } else {
          setDealOwners([]);
        }
      } catch {
        // handle error
      }
    };
    if (userid) getDealOwners();
  }, [userid, dealOwnerPopupOpen]);

  useEffect(() => {
    if (mtasks && mtasks?.length > 0) {
      const combined: any[] = [];
      const is:any[]=[]
      mtasks.forEach((task) => {
        (task.items || []).forEach((item: any) => {
          combined.push({
            title: item.Name || "",
            image: item.itempics?.[0] || "",
            costprice: item.price || 0,
            size: task.size || "",
            source: "items",
            sellprice: 0,
            quantity: item.quantity || 1,
          });
        });
        (task.stockxitem || []).forEach((item: any) => {
          combined.push({
            title: item.name || "",
            image: item.image || "",
            costprice: item.last_sale_price || 0,
            size: item.size || task.size || "",
            source: "stockxitem",
            sellprice: 0,
            quantity: item.quantity || 1,
          });
        });
      });
      mtasks.forEach((task)=>{
        is.push(task._id)
      })
      setDummyLinedata(combined);
      setcus(mtasks[0].cusid)
      setids(is)
    }
  }, [mtasks]);

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
      // handle error
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setShippingAddress(value);
    setSelectedAddress(null);
    setShowSeparateFields(false);
    debouncedSearch(value);
  };

  const handleAddressSelect = (suggestion: any) => {
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

  const handleFieldChange = (field: string, value: string) => {
    setAddressFields(prev => ({
      ...prev,
      [field]: value
    }));
    setShippingAddressObj((prev: any) => ({
      ...prev!,
      [field === 'address' ? 'address1' : field]: value
    }));
  };

  const handleTextareaFocus = () => {
    if (addressSuggestions.length > 0 && !selectedAddress) {
      setShowAddressDropdown(true);
    }
  };

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
  }, [addressDropdownRef, textareaRef, paymentDropdownOpen, sourceopen]);

  const handleLineChange = (i: number, field: 'costprice' | 'sellprice', value: number) => {
    const updateline = [...dummyLinedata];
    updateline[i] = {
      ...updateline[i],
      [field]: value,
    };
    setDummyLinedata(updateline);
  };
 
  const Submit = async () => {
  
    if (
      customerName &&
      shippingFee &&
      processingFee &&
      source &&
      supplier &&
      (showSeparateFields ? addressFields.address : shippingAddressObj?.address1) &&
      dealOwner &&
      paymentMethod &&
      dummyLinedata.every(item => item.costprice && item.sellprice)
    ) {
      setIsSubmitting(true);
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/Confrimorder/Confirm_merge_order`,
          {
            idobj:mtasks,
            Name: customerName,
            Supplierid: supplier,
            Shippingfee: shippingFee,
            processingfee: processingFee,
            shippingaddress: showSeparateFields ? addressFields : shippingAddressObj,
            Sourceofthruth: source,
            paymentmethod: paymentMethod,
            DealOwner: dealOwner,
            lineitems: dummyLinedata,
          }
        );
        onClose();
      } catch {
        toast.error("Failed to submit order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast("Fill all fields");
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (method: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/deleteaddpaymentmethod`, {
        data: { name: method }
      });
      toast.success("Payment method deleted");
      const pay = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/getpaymentmethods`, {
        userid
      });
      setpaymentmethods([...pay.data.data]);
      if (paymentMethod === method) setPaymentMethod("");
    } catch {
      toast.error("Failed to delete payment method");
    }
  };

  // Delete source of truth
  const handleDeleteSource = async (source: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/deletesource`, {
        data: { name: source }
      });
      toast.success("Source deleted");
      // Refetch sources
      const sou = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/getsources`, { userid });
      setsources(sou.data.data);
      if (source === source) setSource("");
    } catch {
      toast.error("Failed to delete source");
    }
  };

  // Dropdown open/close logic for payment/source
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Confirm Order</DialogTitle>
        </DialogHeader>
        {/* Top section: two columns, left = name/email/phone, right = image */}
        <div className="w-full flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex-shrink-0">
            <img
              src={getImage()}
              alt={customerName || "Order image"}
              className="w-[120px] h-[120px] object-contain rounded"
            />
          </div>
          <div className="  w-[60%] h-full flex gap-4   flex-col justify-center items-center text-center">
              <div className="text-lg font-semibold text-wrap">{cus?.first_name+' '+cus?.last_name} </div>
              <div className="text-sm font-semibold text-[#4774B1]">{cus?.email}</div>
              <div className="text-sm font-semibold text-[#4774B1]">{cus?.Number}</div>
            </div>
       
       
        </div>
        <div className="mt-4">
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-1">
                <Label>Confirm Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              {/* Supplier */}
              <div className="flex flex-col gap-1">
               
                <SupplierDropdown
                  availsuppliers={availsuppliers || []}
                  supplierUsed={supplier}
                  setSupplierUsed={setSupplier}
                  getsuppliers={() => {}}
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <Label>Deal Owner</Label>
                <div className="flex gap-2 items-center relative">
                  <select className="w-full border rounded px-3 py-2 mt-1"
                    value={dealOwner} onChange={(e) => setDealOwner(e.target.value)}>
                    <option value="">Select Deal Owner</option>
                    {dealOwners && dealOwners.map((owner) => (
                      <option key={owner._id} value={owner._id}>{owner.name}</option>
                    ))}
                  </select>
                  <Button type="button" size="icon" variant="default" className="mt-1 bg-black text-white" onClick={() => setDealOwnerPopupOpen(true)}>
                    <Plus size={16} color="white" />
                  </Button>
                </div>
              </div>
             
              <div className="flex flex-col gap-1">
                <Label>Source of Truth</Label>
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
                    <span>{source || "Select Source"}</span>
                    <ChevronDown size={16} />
                  </button>
                  <Button type="button" size="icon" variant="outline" className="mt-1" onClick={() => setbrandopen(true)}>
                    <Plus size={16} />
                  </Button>
                  {sourceopen && (
                    <div ref={sourceDropdownRef} className="absolute z-50 left-0 top-full mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto">
                      {Array.isArray(sources) && sources.length > 0 ? (
                        sources.map((src) => (
                          <div key={src} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            <span
                              className="flex-1 text-left"
                              onClick={() => {
                                setSource(src);
                                setsourceopen(false);
                              }}
                            >
                              {src}
                            </span>
                            <button
                              className="ml-2 text-gray-400 hover:text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteSource(src);
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
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Address Input */}
              <div className="flex flex-col gap-1">
                <Label>Shipping Address</Label>
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
                                  {[suggestion.city, suggestion.postcode].filter(Boolean).join(', ')}
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
                  {isLoadingAddress && (
                    <div className="absolute right-3 top-10">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Shipping Fee */}
              <div className="flex flex-col gap-1">
                <Label>Shipping Fee</Label>
                <Input
                  value={shippingFee}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setShippingFee(val);
                    }
                  }}
                />
              </div>
              {/* Processing Fee */}
              <div className="flex flex-col gap-1">
                <Label>Processing Fee</Label>
                <Input
                  value={processingFee}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setProcessingFee(val);
                    }
                  }}
                />
              </div>
              {/* Payment Method */}
              <div className="flex flex-col gap-1">
                <Label>Payment Method</Label>
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
                    <span>{paymentMethod || "Select Method"}</span>
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
                      ) :
                       (
                        <div className="px-3 py-2 text-gray-400">No payment methods</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
         
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Line Item Costs</h3>
            <div className="space-y-6">
              {dummyLinedata && dummyLinedata.map((item, i) => (
                <div key={i} className="border rounded-lg p-4 bg-gray-50">
                  {/* Row: title left, image right */}
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="font-semibold">{item.title} x{item.quantity}</div>
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded"
                    />
                  </div>
                  {/* Row: cost price and sell price inputs */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label>Cost Price</Label>
                      <Input
                        className="w-full"
                        type="number"
                        value={item.costprice}
                        onChange={e => handleLineChange(i, 'costprice', parseFloat(e.target.value))}
                        min={0}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Sell Price</Label>
                      <Input
                        className="w-full"
                        type="number"
                        value={item.sellprice}
                        onChange={e => handleLineChange(i, 'sellprice', parseFloat(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          <div className="pt-6 flex justify-center">
            <Button className="w-32" onClick={Submit} disabled={isSubmitting}>
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
        </div>
      </DialogContent>
      <AddPaymentPopup open={paymentPopupOpen} setOpen={setPaymentPopupOpen} onSuccess={() => {
        // Refetch payment methods after adding
        axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/PaymentMethods/getpaymentmethods`, { userid }).then(res => setpaymentmethods(res.data.data || []));
      }} />
      <AddSourceOfTruthPopup open={brandopen} setOpen={setbrandopen} onSuccess={async () => {
        // Refetch sources after adding
        const sou = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/Sourceoftruth/getsources`, { userid });
        setsources(sou.data.data);
      }} />
    </Dialog>
  );
}


export function MergeConfirmPopup({ open, onCancel, onMerge }: {
  open: boolean;
  onCancel: () => void;
  onMerge: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md p-6 rounded-xl shadow-lg flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Other order found for same customer</DialogTitle>
        </DialogHeader>
        <div className="my-4 text-center">Do you wanna merge them?</div>
        <div className="flex gap-4 justify-center w-full mt-4">
          <Button variant="outline" className="w-32" onClick={onCancel}>Cancel</Button>
          <Button className="w-32" onClick={onMerge}>Merge</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
