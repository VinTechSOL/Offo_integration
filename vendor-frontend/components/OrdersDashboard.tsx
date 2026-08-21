import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { StatCard } from './StatCard';
import { OrderRow } from './OrderRow';
import { ClockIcon, SearchIcon } from './icons'; // Import SearchIcon for filter
import { ConfirmationModal } from './Confirmationsmodal';
import { VendorOrdersApi } from '@/apis/vendorOrders';

const LIVE_TABS = [
    { key: OrderStatus.Incoming, label: 'Incoming Orders' },
    { key: OrderStatus.Preparing, label: 'Preparing' },
    { key: OrderStatus.Ready, label: 'Ready To Take' },
    { key: OrderStatus.PickedUp, label: 'Picked up' },
];

const SCHEDULED_TABS = [
    { key: "SCHEDULED", label: 'Scheduled Orders' },
];

interface OrdersDashboardProps {
  isScheduledView?: boolean;
  isTodayView?: boolean;
}

export const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ isScheduledView = false,isTodayView = false }) => {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(isScheduledView ? "SCHEDULED" : OrderStatus.Incoming);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string; 
    confirmColor?: 'orange' | 'red' | 'blue' | 'yellow' | 'green';
  } | null>(null);

  // State for scheduled order filters
  const [filterDate, setFilterDate] = useState<string>(''); // YYYY-MM-DD
  
  const TABS = isScheduledView ? SCHEDULED_TABS : isTodayView ? [] : LIVE_TABS;
  
  const displayedOrders = useMemo(() => {

    let filtered: Order[] = [];

    if (isScheduledView) {
      filtered = orders.filter(o => o.scheduledAt);
    } else if (isTodayView) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = orders.filter(o => {

        // If order is scheduled
        if (o.scheduledAt) {
          const scheduledDate = new Date(o.scheduledAt);
          scheduledDate.setHours(0, 0, 0, 0);

          // Only include if scheduled date is today
          return scheduledDate.getTime() === today.getTime();
        }

        // Normal live order
        return true;
      });
    } else {
      filtered = orders.filter(o => o.status === activeTab);
    }

    filtered = filtered.sort(
      (a,b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    if (isScheduledView ) {
      filtered = filtered.filter(order => {
        if (!order.scheduledAt) return false;

        const orderScheduledDate = new Date(order.scheduledAt);
        let matchesDate = true;

        if (filterDate) {
          const [year, month, day] = filterDate.split('-').map(Number);
          matchesDate = orderScheduledDate.getFullYear() === year &&
                        orderScheduledDate.getMonth() + 1 === month &&
                        orderScheduledDate.getDate() === day;
        }


        return matchesDate;
      });
    }

    return filtered;
  }, [orders, activeTab, isScheduledView, filterDate]);

  const groupedScheduledOrders = useMemo(() => {
    if (!isScheduledView) return {};

    const groups: Record<string, Order[]> = {};

    displayedOrders.forEach(order => {
      if (!order.scheduledAt) return;

      const date = new Date(order.scheduledAt);
      const key = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(order);
    });

    // Sort orders inside each group by time
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime()
      );
    });

    return groups;
  }, [displayedOrders, isScheduledView]);


  useEffect(() => {
    console.log("all order status:" , orders);
    console.log("active tab:",activeTab);
    console.log("filtered orders:",displayedOrders);
  }, [orders, activeTab, displayedOrders]);



  useEffect(() => {
    
    let active = true;
    let poll: number | undefined;

    const load = async () => {

      try {
        setLoading(true);
        let data;

        if (isScheduledView) {
          data = await VendorOrdersApi.getScheduled();
        } else if (isTodayView) {
          data = await VendorOrdersApi.getToday();
        } else {
          data = await VendorOrdersApi.getLive();
        }
      
        if (active) {
          setOrders(data);
          setLoading(false)
          console.log("fetched orders",data);

        }
      } catch (err) {
        console.error("failed to load orders",err)
      }  
    };

    load();

    const startPolling = () => {
      if (!isScheduledView && !isTodayView) {
        poll = window.setInterval(load, 15000);
      }
    };

    const stopPolling = () => {
      if (poll) clearInterval(poll);
    };


    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        startPolling();
        load(); // instant refresh when user returns
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    startPolling();
    
    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isScheduledView, isTodayView]);


  useEffect(() => {

    const handleHighPriority = (event: any) => {
      const orderId = event.detail.orderId;

      // Switch to Incoming tab
      setActiveTab(OrderStatus.Incoming);

      // Wait for DOM render
      setTimeout(() => {
        const element = document.getElementById(`order-${orderId}`);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          element.classList.add("ring-4", "ring-red-400");

          setTimeout(() => {
            element.classList.remove("ring-4", "ring-red-400");
          }, 3000);
        }
      }, 400);
    };

    window.addEventListener("high-priority-order", handleHighPriority);

    return () => {
      window.removeEventListener("high-priority-order", handleHighPriority);
    };

  }, []);


  useEffect(() => {
    setSelectedOrders([]);
  }, [activeTab]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    
    try{
      if (newStatus === OrderStatus.Preparing) {
        await VendorOrdersApi.accept(orderId);

        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.Preparing } : o)
        );
        return;
      } 

    
      await VendorOrdersApi.move(orderId, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (e){
      console.error(e);
      alert("Order status change failed");
    } finally {
      
    }
    
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await VendorOrdersApi.reject(orderId);

      // Rejected orders should disappear from Live Orders.
      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    } catch (e) {
      console.error('Order rejection failed:', e);
      alert('Failed to reject order. Please try again.');
    }
  };
  
  const handleToggleSelection = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(displayedOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };
  
  const handleRequestCancel = (orderId: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Reject Order',
      message: `Are you sure you want to reject order ${orderId}? The customer will be refunded.`,
      onConfirm: async () => {
        await handleRejectOrder(orderId);
        setConfirmation(null);
      },
      confirmText: 'Yes, Reject',
      cancelText: 'No, Keep Order',
      confirmColor: 'red',
    });
  };

  const handleBulkStatusUpdate = (newStatus: OrderStatus) => {
    let actionText = '';
    let confirmTitle = '';
    let confirmButtonText = '';
    let confirmButtonColor: 'orange' | 'red' | 'blue' | 'yellow' | 'green' = 'orange';

    switch (newStatus) {
      case OrderStatus.Preparing:
        actionText = 'accept';
        confirmTitle = 'Confirm Bulk Accept';
        confirmButtonText = 'Yes, Accept';
        confirmButtonColor = 'orange';
        break;
      case OrderStatus.Ready:
        actionText = 'mark as ready';
        confirmTitle = 'Confirm Bulk Ready';
        confirmButtonText = 'Yes, Mark Ready';
        confirmButtonColor = 'blue';
        break;
      case OrderStatus.PickedUp:
        actionText = 'mark as picked up';
        confirmTitle = 'Confirm Bulk Picked Up';
        confirmButtonText = 'Yes, Mark Picked Up';
        confirmButtonColor = 'green';
        break;
      default:
        actionText = 'update';
        confirmTitle = 'Confirm Bulk Action';
        confirmButtonText = 'Yes, Update';
        confirmButtonColor = 'orange';
    }

    setConfirmation({
        isOpen: true,
        title: confirmTitle,
        message: `Are you sure you want to ${actionText} ${selectedOrders.length} selected order(s)?`,
        onConfirm: () => {
            setOrders(orders.map(order => 
                selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order
            ));
            setSelectedOrders([]);
            setConfirmation(null);
        },
        confirmText: confirmButtonText,
        cancelText: 'Cancel',
        confirmColor: confirmButtonColor,
    });
  };

  const handleApplyFilter = () => {
    // Force re-evaluation of memoized displayedOrders
    // No explicit action needed here as state updates (filterDate, filterTime) will trigger it.
  };

  const handleClearFilters = () => {
    setFilterDate('');
  };
  
  const totalOrders = orders.length;
  const incomingOrdersCount = orders.filter(o => o.status === OrderStatus.Incoming).length;
  const preparingCount = orders.filter(o => o.status === OrderStatus.Preparing).length;
  const pickedUpCount = orders.filter(o => o.status === OrderStatus.PickedUp).length;
  
  const scheduledOrders = useMemo(() => orders.filter(o => o.scheduledAt), [orders]);
  const upcomingToday = useMemo(() => scheduledOrders.filter(o => {
    if (!o.scheduledAt) return false;
    const today = new Date();
    const orderDate = new Date(o.scheduledAt);
    return orderDate.toDateString() === today.toDateString();
  }).length, [scheduledOrders]);
  const upcomingThisWeek = useMemo(() => scheduledOrders.filter(o => {
    if (!o.scheduledAt) return false;
    const today = new Date();
    const orderDate = new Date(o.scheduledAt);

    // Set today to start of week (Sunday)
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    // Set end of week (Saturday)
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Ensure end of day

    return orderDate >= startOfWeek && orderDate <= endOfWeek;
  }).length, [scheduledOrders]);


  //const showCheckboxes = !isScheduledView && [OrderStatus.Incoming, OrderStatus.Preparing, OrderStatus.Ready].includes(activeTab);
  const showCheckboxes = false;

  const renderBulkActionButton = () => {
    const isButtonDisabled = selectedOrders.length === 0;
    const baseClass = "bg-offo-orange hover:bg-offo-orange-dark text-white font-bold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    switch (activeTab) {
      case OrderStatus.Incoming:
        return (
          <button onClick={() => handleBulkStatusUpdate(OrderStatus.Preparing)} className={baseClass} disabled={isButtonDisabled}>
            Accept Selected
          </button>
        );
      case OrderStatus.Preparing:
        return (
          <button onClick={() => handleBulkStatusUpdate(OrderStatus.Ready)} className={`${baseClass} bg-blue-500 hover:bg-blue-600`} disabled={isButtonDisabled}>
            Mark as Ready
          </button>
        );
      case OrderStatus.Ready:
        return (
          <button onClick={() => handleBulkStatusUpdate(OrderStatus.PickedUp)} className={`${baseClass} bg-green-500 hover:bg-green-600`} disabled={isButtonDisabled}>
            Mark as Picked Up
          </button>
        );
      default:
        return null;
    }
  };


  const formatDateLabel = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const date = new Date(dateString);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {loading && (
        <div className="flex  justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-offo-orange border-t-transparent"></div>
        </div>
      )}
      
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 gap-4 sm:flex sm:flex-nowrap sm:items-center sm:divide-x sm:divide-white/10 text-white">
        {isScheduledView ? (
          <>
            <StatCard title="Total Scheduled" value={scheduledOrders.length} />
            <StatCard title="Upcoming Today" value={upcomingToday} />
            <StatCard title="Upcoming This Week" value={upcomingThisWeek} />
          </>
        ) : isTodayView ? (
          <>
            <StatCard title="Total Orders Today" value={orders.length} />
            <StatCard
              title="Completed"
              value={orders.filter(o => o.status === OrderStatus.Completed).length}
            />
            <StatCard
              title="Rejected"
              value={orders.filter(o => o.status === OrderStatus.Rejected).length}
            />
            <StatCard
              title="Active"
              value={orders.filter(o =>
                [OrderStatus.Incoming, OrderStatus.Preparing, OrderStatus.Ready].includes(o.status)
              ).length}
            />
          </>
        ) : (
          <>
            <StatCard title="Total Orders" value={totalOrders} />
            <StatCard title="Incoming Orders" value={incomingOrdersCount} />
            <StatCard title="Preparing" value={preparingCount} />
            <StatCard title="Picked-Up" value={pickedUpCount} />
          </>
        )}
      </div>

      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm">
        {!isTodayView && (
          <div className="border-b border-gray-200">
            <div className="flex items-center -mb-px overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-3 md:px-5 text-sm font-semibold transition-colors flex items-center space-x-2 capitalize flex-shrink-0 ${activeTab === tab.key ? 'text-offo-orange border-b-2 border-offo-orange' : 'text-text-secondary hover:text-offo-orange'}`}
                >
                  {activeTab === tab.key && tab.key === OrderStatus.Incoming && (<ClockIcon className="w-4 h-4" />)}
                  <span>{tab.label}</span>
                  {tab.key === OrderStatus.Incoming && incomingOrdersCount > 0 && (<span className="bg-offo-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{incomingOrdersCount}</span>)}
                </button>
              ))}
            </div>
          </div>

        )}
        

        {isScheduledView   && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-center gap-4">
            <h3 className="text-lg font-bold text-text-primary mr-auto">Filter Scheduled Orders</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 text-sm focus:ring-offo-orange focus:border-offo-orange w-full"
                aria-label="Filter by date"
              />
              <button
                onClick={handleApplyFilter}
                className="bg-offo-orange hover:bg-offo-orange-dark text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex-shrink-0"
                aria-label="Apply filters"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex-shrink-0"
                aria-label="Clear filters"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
           {showCheckboxes && (
            <>
            {/* Desktop Header */}
            <div className="bg-offo-tan-light rounded-lg p-3 text-sm font-semibold text-text-primary mb-3 hidden lg:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center space-x-4">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={displayedOrders.length > 0 && selectedOrders.length === displayedOrders.length}
                      onChange={handleToggleSelectAll}
                      disabled={displayedOrders.length === 0}
                      aria-label="Select all orders"
                    />
                    <span className="text-text-secondary">ORDER ID / Customer Name</span>
                </div>
                
                {selectedOrders.length > 0 ? (
                    <>
                        <div className="col-span-5 flex items-center gap-4">
                            {renderBulkActionButton()}
                            <button onClick={() => setSelectedOrders([])} className="text-text-secondary font-semibold hover:underline">
                                Clear
                            </button>
                        </div>
                        <div className="col-span-3 text-text-secondary"></div>
                    </>
                ) : (
                    <>
                        <div className="col-span-3 text-text-secondary">ITEM</div>
                        <div className="col-span-2 text-text-secondary">PAYMENT</div>
                        <div className="col-span-1 text-text-secondary">STATUS</div>
                        <div className="col-span-2 text-text-secondary">UPDATE STATUS</div>
                    </>
                )}
            </div>
            
            {/* Mobile Header / Bulk Actions */}
            <div className="lg:hidden mb-4">
                  {displayedOrders.length > 0 && (
                      <div className="bg-offo-tan-light rounded-lg p-4 flex items-center justify-between">
                          <label className="flex items-center space-x-3 text-sm font-semibold text-text-secondary">
                              <input
                                  type="checkbox"
                                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  checked={selectedOrders.length === displayedOrders.length && displayedOrders.length > 0}
                                  onChange={handleToggleSelectAll}
                                  aria-label="Select all orders"
                                  disabled={displayedOrders.length === 0}
                              />
                              <span>{selectedOrders.length > 0 ? `${selectedOrders.length} selected` : `Select All`}</span>
                          </label>
                          
                          {selectedOrders.length > 0 && (
                              <div className="flex items-center space-x-2 animate-fadeIn">
                                  {renderBulkActionButton()}
                                  <button onClick={() => setSelectedOrders([])} className="text-text-secondary font-semibold text-sm hover:underline">
                                      Clear
                                  </button>
                              </div>
                          )}
                      </div>
                  )}
            </div>
            </>
           )}


          <div className="space-y-4">
            {isScheduledView ? (
              Object.keys(groupedScheduledOrders).length > 0 ? (
                Object.keys(groupedScheduledOrders)
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map(dateKey => (
                   <div key={dateKey} className="space-y-3">

                    {/* Date Header */}
                    <div className="bg-slate-100 text-slate-800 font-semibold px-4 py-2 rounded-md shadow-sm">
                    📅 {formatDateLabel(dateKey)} ({groupedScheduledOrders[dateKey].length})
                    </div>

                    {/* Orders Under That Date */}
                    {groupedScheduledOrders[dateKey].map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        onRequestCancel={handleRequestCancel}
                        isSelected={selectedOrders.includes(order.id)}
                        onToggleSelection={handleToggleSelection}
                        showCheckbox={showCheckboxes}
                        isScheduledView={isScheduledView}
                        isTodayView={isTodayView}
                       />
                     ))}

                   </div>
                 ))
             ) : (
               <div className="text-center py-16 text-text-secondary">
                 <p className="font-semibold">No scheduled orders.</p>
               </div>
             )
           ) : (

             displayedOrders.length > 0 ? (
               displayedOrders.map(order => (
                 <OrderRow 
                    key={order.id} 
                    order={order} 
                    onStatusChange={handleStatusChange} 
                    onRequestCancel={handleRequestCancel}
                    isSelected={selectedOrders.includes(order.id)}
                    onToggleSelection={handleToggleSelection}
                    showCheckbox={showCheckboxes}
                    isScheduledView={isScheduledView}
                    isTodayView={isTodayView}
                          
                  />
               ))
             ) : (
               <div className="text-center py-16 text-text-secondary">
                 <p className="font-semibold">No orders in this category yet.</p>
                 <p className="text-sm">They will appear here when they arrive.</p>
               </div>
             )
           )}
          </div>
        </div>
      </div>
      {confirmation?.isOpen && (
          <ConfirmationModal 
              isOpen={confirmation.isOpen}
              onClose={() => setConfirmation(null)}
              onConfirm={confirmation.onConfirm}
              title={confirmation.title}
              message={confirmation.message}
              confirmText={confirmation.confirmText}
              cancelText={confirmation.cancelText}
              confirmColor={confirmation.confirmColor}
          />
      )}
    </div>
  );
};