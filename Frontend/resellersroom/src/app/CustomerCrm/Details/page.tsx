"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, User, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/Resellerstore';
import { toast } from 'sonner';
import { Custprop, Task } from '@/app/Components/Small comps/Types';
import EditPopup from '../../Components/Customer/Editpopup';
import { Toogle_Editopen, AddSelectedCustomer } from '@/lib/features/CustomerCrm/CustomerCrmslice';

const Header = () => {
  return (
    <div className="w-full flex flex-col h-[10vh] lg:flex-row justify-between items-center gap-2 p-4 bg-white sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="w-[40px] h-[40px]">
          <img src="/images/Crm.png" className="w-full h-full" />
        </div>
        <h1 className="text-3xl font-semibold text-[#888888] dark:text-[#888888]">Customer Details</h1>
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedCustomer = useSelector((state: RootState) => state.Cus.Selected_customer);
  const [search, setSearch] = useState("");
  const [order, setorder] = useState<Task[]|null>(null);
  const [tp,settp]=useState<number>(0)

  const getorders = async () => {
    try {
      const k = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/orders/getOrderofCustomer`,
        {
          id: selectedCustomer._id,
        });
      setorder(k.data.data);
      settp(k.data.p)
    } catch  {
      toast.error("Something wrong with getting order for this customer");
    }
  };

  const handleEdit = () => {
    if (selectedCustomer) {
      dispatch(AddSelectedCustomer(selectedCustomer));
      dispatch(Toogle_Editopen());
    } else {
      toast.error("No customer selected");
    
    }
  };

  const refreshCustomerData = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_HOST}/api/customers/getAllCustomers`, {
        userid: localStorage.getItem("tempcred"),
      });
      
      // Find the updated customer in the response
      const updatedCustomer = response.data.Customers.find(
        (customer: Custprop) => customer._id === selectedCustomer._id
      );
      
      if (updatedCustomer) {
        dispatch(AddSelectedCustomer(updatedCustomer));
      }
      
      getorders();
    } catch  {
      toast.error("Error refreshing customer data");
    }
  };

  useEffect(() => {
    if (selectedCustomer) {
      getorders();
    }
  }, [selectedCustomer]);



  if (!selectedCustomer) {
    return (
      <div className="w-[80vw] text-black flex items-center justify-center">
        <p>No customer selected</p>
      </div>
    );
  }

  return (
    <div className="w-[80vw] text-black">
      <Header />
      
      {/* Edit Dialog */}
      <EditPopup
        method='crm'
        getcustomers={refreshCustomerData}
      />

      {/* Back Button */}
      <div className="w-full h-[3vh] mt-[2vh] bg-white flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 ml-5 text-black hover:text-gray-600"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="w-[95%] ml-6 h-[82vh] mt-[2vh] p-4 flex flex-col">
        {/* Customer Info Section - Reduced height */}
        <div className="w-full h-[14%] flex justify-between mb-4">
          {/* Left Side - Customer Info */}
          <div className="w-[60%] flex gap-3">
            <div className="w-[80px] h-[80px] rounded-full bg-gray-200 flex items-center justify-center">
              <User size={40} className="text-gray-400" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-lg font-bold mb-1">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h2>
              <p className="text-gray-600 text-sm mb-1">{selectedCustomer.email}</p>
              <p className="text-gray-600 text-sm mb-2">{selectedCustomer.Number}</p>
              <button 
                onClick={handleEdit}
                className="bg-blue-400 text-white px-3 py-1 rounded-full w-fit text-sm hover:bg-blue-500"
              >
                Edit Customer
              </button>
            </div>
          </div>

          {/* Right Side - Stats */}
          <div className="w-[40%] flex gap-4">
            {/* Orders Card */}
            <div className="flex-1 bg-[#F3F3F3] rounded-xl p-3">
              <div className="text-sm font-semibold mb-1">Total Orders</div>
              <div className="text-xl font-bold">{order?.length || 0}</div>
            </div>

            {/* Spend Card */}
            <div className="flex-1 bg-[#F3F3F3] rounded-xl p-3">
              <div className="text-sm font-semibold mb-1">Total Spend</div>
              <div className="text-xl font-bold">£{tp|| 0}</div>
            </div>
          </div>
        </div>

        {/* Orders Section - Increased height */}
        <div className="w-full h-[92%]">
          {/* Orders Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Orders</h3>
              <span className="bg-gray-200 px-2 py-1 rounded-full text-sm">
                {order?.length || 0}
              </span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="px-4 py-2 border-2 border-gray-300 rounded-lg w-64"
            />
          </div>

          {/* Orders Split Layout */}
          <div className="w-full h-[calc(100%-60px)] flex gap-4">
            {/* Left Side - Orders List */}
            <div className="w-[70%] h-[90%] border-r-2 border-gray-700 pr-4 overflow-y-auto [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-neutral-700
              dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10 w-full">
                {order && order.length > 0 ? (
                  order.map((orderItem) => (
                    <div
                      key={orderItem._id}
                      className="bg-white shadow-md rounded-lg border border-gray-200 flex flex-col gap-2"
                      style={{ width: "100%", height: "200px" }}
                    >
                      <div className="text-black px-4 py-2.5 text-sm flex items-center justify-between border-b border-gray-100">
                        <div className="text-gray-600 whitespace-nowrap">
                          {new Date(orderItem.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 whitespace-nowrap">
                          from <Store size={14} strokeWidth={0.75} /> online store
                        </div>
                      </div>

                      <div className="flex px-4 gap-4 flex-1 overflow-hidden">
                        <div className="w-[120px] h-[120px] shrink-0">
                          <img
                            src={
                              orderItem?.stockxitem?.[0]?.image ??
                              orderItem?.items?.[0]?.itempics ??
                              "/images/Logo.png"
                            }
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-around min-w-0 overflow-hidden">
                          <div className="text-xl font-bold text-black line-clamp-2 break-words">
                            {orderItem.Name ? orderItem.Name : "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {orderItem.shippingaddress ? orderItem.shippingaddress : "N/A"}
                          </div>
                          <div className="font-bold text-lg text-[#4774B1]">
                            £ {orderItem.price && orderItem.sellprice && orderItem.Shippingfee && orderItem.processingfee 
                              ? orderItem.sellprice - orderItem.price - parseFloat(orderItem.Shippingfee) - parseFloat(orderItem.processingfee) 
                              : "N/A"} Profits
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 h-[90%] flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No orders available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Customer Details */}
            <div className="w-[30%] h-full overflow-auto">
              <div className="bg-white p-4 rounded-lg max-h-[94%] border border-gray-300 overflow-y-auto [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
                  <h3 className="text-lg font-semibold">Customer Details</h3>
                  {/* <button className="bg-blue-400 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-500">
                    Edit
                  </button> */}
                </div>
                <div className="space-y-3">
                <div>
                    <p className="text-sm text-gray-500">first Name</p>
                    <p className="text-sm font-medium">{selectedCustomer.first_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="text-sm font-medium">{selectedCustomer.last_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{selectedCustomer.Number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Social Handle</p>
                    <p className="text-sm font-medium">{selectedCustomer.socialhandel || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium">
                      {selectedCustomer.address?.adress1 ? (
                        <>
                          {selectedCustomer.address.adress1}<br />
                          {selectedCustomer.address.city}, {selectedCustomer.address.zip}<br />
                          {selectedCustomer.address.country}
                        </>
                      ) : 'N/A'}
                    </p>
                  </div> */}
                  <div>
                    <p className="text-sm text-gray-500">Marketing Status</p>
                    <p className="text-sm font-medium">
                      {selectedCustomer.emailMarketingConsent?.marketingState === 'subscribed' ? 
                        <span className="text-green-600">Opted In</span> : 
                        <span className="text-red-600">Opted Out</span>
                      }
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCustomer.tags && selectedCustomer.tags.length > 0 ? (
                        selectedCustomer.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
