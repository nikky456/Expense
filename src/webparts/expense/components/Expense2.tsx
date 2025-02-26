import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import {  Web} from "sp-pnp-js";
import { useReactTable,flexRender,getCoreRowModel,getSortedRowModel, getFilteredRowModel,} from '@tanstack/react-table';
import './Style.css'
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { DefaultButton, PrimaryButton, Dropdown, IDropdownOption, TextField,} from '@fluentui/react';
import { Panel, PanelType ,} from "@fluentui/react/lib/Panel";
import { FaAngleUp } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa";
import Swal from "sweetalert2";
import moment from 'moment';

type Expense = {
    ExpenseDate: string; 
    PaymentMode: string;
    ExpenseType: string;
    Amount: number;
    AmountType:string;
  };

  const Expense2 = () => {
    const [data,setData]=React.useState<any[]>([]);
   const [columnFilters, setColumnFilters] = React.useState<{ id: string; value: string }[]>([]);
   const [selectedExpenseType, setSelectedExpenseType] = React.useState<string>('');
  const [selectedPaymentmode, setSelectedPaymentmode] = React.useState<string>('');
  const [Createdname,setCreatedname] = React.useState();
  const [Createddate,setCreateddate] = React.useState();
  const [Modifiedname,setModifiedname] = React.useState();
  const [Modifiedate,setModifieddate] = React.useState();

   const [isPanelOpen, setIsPanelOpen] = React.useState(false);
      const [formdata, setFormdata] = React.useState({
          ExpenseDate:"",
          PaymentMode:"",
          ExpenseType:"",
          Amount:0,
          AmountType:"Expense"
        });
   
       const [editId, setEditId] = React.useState(null);
       
    const fetchApidata = async () => {
         try {
           const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/F4S");
           const res = await web.lists
             .getByTitle("Expenses")
             .items.select(
               "Id",
               "ExpenseDate",
               "PaymentMode",
               "ExpenseType",
               "Amount",
               "AmountType",
               "Modified",
               "Created",
               "Author/Id",
              " Author/Title",
               "Editor/Id",
               "Editor/Title"
             ).expand("Author,Editor")
             .top(4999)
             .get();
       
           const filteredData = res.filter((item: any) => item.AmountType === 'Expense');
       
           const formattedData = filteredData.map((item: any) => ({
            Id: item.Id, 
            ExpenseDate: item.ExpenseDate ? moment(item.ExpenseDate).format("DD/MM/YYYY") : null,
            PaymentMode: item.PaymentMode || "N/A",
            ExpenseType: item.ExpenseType || "N/A",
            Amount: item.Amount || 0,
            AmountType: item.AmountType || "N/A",
            Modified: item.Modified ? moment(item.Modified).format("DD/MM/YYYY") : null,
            Created: item.Created ? moment(item.Created).format("DD/MM/YYYY") : null,
            Author: item.Author 
              ? { Id: item.Author.Id, Name: item.Author.Title } 
              : { Id: "N/A", Name: "N/A" },
            Editor: item.Editor 
              ? { Id: item.Editor.Id, Name: item.Editor.Title } 
              : { Id: "N/A", Name: "N/A" },
          }));
           setData(formattedData);
         } catch (error) {
           console.error("Error fetching data:", error);
         }
       };
   
       
       React.useEffect(() => {
           fetchApidata();
       }, []); 
   
       console.log("total data",data);

        const handleAddTask = async () => {
           setEditId(null);
           try {
             const postData = {
               ExpenseDate: formdata.ExpenseDate
               ? new Date(formdata.ExpenseDate).toISOString()
               : null,
               PaymentMode: formdata?.PaymentMode || "",
               Amount: formdata?.Amount || 0,
               ExpenseType: formdata?.ExpenseType || "",
               AmountType: formdata.AmountType || "Expense",
              
             };
             const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/F4S");
             let res = await web.lists.getById("C72D4C84-CD85-425F-AC23-ABC284DC4406").items.add(postData);
       
             console.log("Added item response:", res);
            
             setFormdata({
            ExpenseDate:"",
            PaymentMode:"",
           ExpenseType:"",
           Amount:0,
           AmountType:"Expense"
             });
             fetchApidata();
           } catch (error) {
             console.error("Error adding item:", error);
           }
         };
         const handleSaveTask = async () => {
             try {
               if (editId !== null ) {
                 await updateDetails(editId);
                 Swal.fire({
                   text: "You have successfully updated items!",
                   icon: "success",
                 });
               } else {
                 await handleAddTask();
                 Swal.fire({
                   text: "You have successfully added items!",
                   icon: "success",
                 });
               }
               setIsPanelOpen(false);
             } catch (error) {
               console.error("Error saving task:", error);
               Swal.fire({
                 title: "Error!",
                 text: "An error occurred while saving the task.",
                 icon: "error",
               });
             }
             setIsPanelOpen(false);
           };
         
           const handleNewTask = () => {
             setFormdata({
                 ExpenseDate:"",
                 PaymentMode:"",
                 ExpenseType:"",
                 Amount:0,
                 AmountType:"Expense"
             });
             setEditId(null);
             setIsPanelOpen(true);
           };
           
           
         
           const handleEdit = (item: any) => {
             setEditId(item.Id);
             const selecteditem = item;
             setFormdata({
                 ExpenseDate: selecteditem.ExpenseDate
               ? moment(selecteditem.ExpenseDate, "DD/MM/YYYY").format("YYYY-MM-DD")
               : "",
                 PaymentMode: selecteditem?.PaymentMode ,
                 Amount: selecteditem?.Amount || 0,
                 ExpenseType: selecteditem?.ExpenseType ,
                 AmountType: selecteditem.AmountType || 'Expense',
             });
             setCreatedname(selecteditem.Author?.Name || "");
             setCreateddate(selecteditem.Created || "");
             setModifiedname(selecteditem.Editor?.Name || "");
             setModifieddate(selecteditem.Modified || "");
             setIsPanelOpen(true);
           };
         
           const updateDetails = async (id: number) => {
             try {
               const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/F4S");
               await web.lists
                 .getById("C72D4C84-CD85-425F-AC23-ABC284DC4406")
                 .items.getById(id)
                 .update({
                  ExpenseDate: formdata.ExpenseDate
                 ? new Date(formdata.ExpenseDate).toISOString()
                 : null,
                     PaymentMode: formdata?.PaymentMode,
                     Amount: formdata?.Amount || 0,
                     ExpenseType: formdata?.ExpenseType,
                     AmountType: formdata?.AmountType || "Expense",
                     
                 });
         
               setIsPanelOpen(false);
               setEditId(null);
         
               fetchApidata();
             } catch (error) {
               console.error("Error updating item:", error);
             }
           };
         
          
           const closePanel = () => {
             setFormdata({
                 ExpenseDate:"",
                 PaymentMode:"",
                 ExpenseType:"",
                 Amount:0,
                 AmountType:"Expense"
             });
         
             setIsPanelOpen(false);
           };
         
           const handleDelete = async (id: number) => {
             Swal.fire({
               title: "Are you sure Delete Item",
               text: "You want to delete this data",
               icon: "warning",
               showCancelButton: true,
               confirmButtonColor: "#3085d6",
               cancelButtonColor: "#d33",
               confirmButtonText: "delete",
             }).then(async (result) => {
               if (result.isConfirmed) {
                 try {
                   const web = new Web('https://smalsusinfolabs.sharepoint.com/sites/F4S');
                   await web.lists
                     .getById("C72D4C84-CD85-425F-AC23-ABC284DC4406")
                     .items.getById(id)
                     .delete()
                     .then(() => {
                       const remaindata = data.filter((item) => item.Id != id);
                       setData(remaindata);
                       fetchApidata();
                       Swal.fire({
                         title: "Deleted!",
                         text: "The item has been deleted successfully.",
                         icon: "success",
                       });
                     });
                 } catch (error) {
                   console.log("data in not delete");
         
                   Swal.fire({
                     title: "Error!",
                     text: "Something went wrong. The item could not be deleted.",
                     icon: "error",
                   });
                 }
               }
             });
           };

           const handleInputChange = (field: keyof Expense, value: string | number) => {
            setFormdata((prev) => ({ ...prev, [field]: value }));
          };

          const amountFilterFn = (row: { getValue: (arg0: any) => number; }, columnId: any, filterValue: any) => {
            if (!filterValue) return true;  // If no input, show all rows
            return row.getValue(columnId) === Number(filterValue); // Convert input to number
          };
          




       const paymentModeOptions: IDropdownOption[] = [
           { key: 'UPI', text: 'UPI' },
          { key: 'NetBanking', text: 'NetBanking' },
           { key: 'Cash', text: 'Cash' },
         ];
         const ExpenseTypeOptions: IDropdownOption[] = [
           { key: 'Electricity Bill', text: 'Electricity Bill' },
          { key: 'Salary', text: 'Salary' },
           { key: 'Equipment purchases and repairs', text: 'Equipment purchases and repairs' },
           { key: 'Cleaning Staff', text: 'Cleaning Staff' },
           { key: 'Others', text: 'Others' },
         ];

         const handleExpenseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedExpenseType(e.target.value);
          };
        
          const handlePaymentmodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedPaymentmode(e.target.value);
          };
    

      const filteredData = data.filter((item) => {
        const ExpenseMatch = selectedExpenseType ? item.ExpenseType === selectedExpenseType : true;
        const PaymentMatch = selectedPaymentmode ? item.PaymentMode === selectedPaymentmode : true;
        return ExpenseMatch &&  PaymentMatch;
      });
       
       const columns=[

        {
            header: 'Serial No.',
            accessorKey: 'serialNo',
            cell: ({ row }: any) => row.index + 1,
          },
        {
            header: () => (
              <select
                
                className="form-select"
                value={selectedExpenseType}
                onChange={ handleExpenseTypeChange}
              >
                <option value="">Expense Type</option>
                <option value="Electricity Bill">Electricity Bill</option>
                <option value="Salary">Salary</option>
                <option value="Equipment purchases and repairs">Equipment purchases and repairs</option>
                <option value="Cleaning Staff">Cleaning Staff</option>
                <option value="Others">Others</option>
                
              </select>
            ),
            accessorKey:'ExpenseType'
          },
        {
            header:'Expense Date',
            accessorKey:'ExpenseDate'
          },
          {
            header: () => (
              <select className="form-select" value={selectedPaymentmode} onChange={handlePaymentmodeChange}>
                <option value="">Payment Mode</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Cash">Cash</option>
              </select>
            ),
            accessorKey: 'PaymentMode',
          },
          {
            header:'Amount',
            filterFn: amountFilterFn,
            accessorKey:'Amount'
          },
         
    
         {
            header: 'Actions',
              cell: ({ row }: any) => {
                const item = row.original; 
                return (
                  <td  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        className="btn"
                        onClick={() => {
                          handleEdit(item);
                          setIsPanelOpen(true);;
                        }}
                      >
                        <FaRegEdit style={{ color: "green" }} />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDelete(item.Id)}
                      >
                        <MdDelete style={{ color: "red" }} />
                      </button>
                    </div>
                  </td>
                );
              },
          }
          
          
       ]

       const tabledata=useReactTable({
        data:filteredData,
        columns,
        state: {
        //   globalFilter,
      columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        // onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel:getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            amountFilterFn, // Register custom filter
          },
        initialState: {
          // pagination: { pageIndex: 0, pageSize: 8 }, 
          sorting: [],
        },
      })

      const onRenderFooterContent = React.useCallback(
        () => (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            {editId != null && (
              <div>
                <div>
                  Created{" "}
                  <span style={{ color: "skyblue", fontSize: "10px" }}>
                    {Createddate}
                  </span>{" "}
                  by{" "}
                  <span style={{ color: "skyblue", fontSize: "10px" }}>
                    {Createdname || "N/A"}
                  </span>
                </div>
                <div>
                  Last modified{" "}
                  <span style={{ color: "skyblue", fontSize: "10px" }}>
                    {Modifiedate}
                  </span>{" "}
                  by{" "}
                  <span style={{ color: "skyblue", fontSize: "10px" }}>
                    {Modifiedname || "N/A"}
                  </span>
                </div>
              </div>
            )}
      
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {editId!=null && (
              <a 
                href={`https://smalsusinfolabs.sharepoint.com/sites/IITIQ/Lists/StaffMembers/EditForm.aspx?ID=${editId}`} 
                style={{ textDecoration: "none", color: "skyblue", fontSize: "14px" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open out-of-the-box form
              </a>
              )}
              <PrimaryButton onClick={handleSaveTask}>Save</PrimaryButton>
              <DefaultButton onClick={() => closePanel()}>Cancel</DefaultButton>
            </div>
          </div>
        ),
        [
          handleSaveTask,
          closePanel,
          Createddate,
          Createdname,
          Modifiedate,
          Modifiedname,
        ]
      );
      
    return (
    <>
        <div className='bg'>
        <h1 className='text-center  pt-3 text-light' >Expense Table</h1>
        <div className="text-right mb-3 clearfix"
         style={{ marginTop: "-20px" }}>
          <button
            className="border-0 my-2  px-3 py-2 rounded-2 mx-3 pull-right  btn btn-primary"

            onClick={handleNewTask}
          >
           Add
          </button>
        </div>
    
        <div className='m-3 mb-3 bg-light'>
        
        <table className="table table-striped table-bordered table-hover bg-light">
      <thead>
    {tabledata.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id}>
            <div className="d-flex">
              <div>
                {/* Input Filter for Non-Dropdown Columns */}
                {header.column.getCanFilter() &&
                header.column.id !== 'ExpenseType' &&
                header.column.id !== 'PaymentMode' ? (
                  <input
                    type="text"
                    placeholder={` ${header.column.columnDef.header}`}
                    value={(header.column.getFilterValue() as string) || ''}
                    onChange={(e) =>
                      header.column.setFilterValue(e.target.value)
                    }
                    className="form-control mt-1"
                  />
                ) : (
                 
                  (header.column.id === 'ExpenseType' || header.column.id === 'PaymentMode') && (
                    <div style={{ marginRight: '15px' }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Sorting Toggles */}
              <div
                style={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: '#97999b',
                  marginLeft: '-20px',
                }}
                onClick={header.column.getToggleSortingHandler()}
              >
                {header.column.id !== 'Actions' &&
                header.column.id !== 'ExpenseType' &&
                header.column.id !== 'PaymentMode' ? (
                  header.column.getIsSorted() === 'asc' ? (
                    <FaAngleUp />
                  ) : (
                    <FaAngleDown />
                  )
                ) : (
                  ''
                )}
                <br />
                {header.column.id !== 'Actions' &&
                header.column.id !== 'ExpenseType' &&
                header.column.id !== 'PaymentMode' ? (
                  header.column.getIsSorted() === 'desc' ? (
                    <FaAngleDown />
                  ) : (
                    <FaAngleUp />
                  )
                ) : (
                  ''
                )}
              </div>
            </div>
          </th>
        ))}
      </tr>
    ))}
  </thead>
  <tbody>
    {tabledata.getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
          </table>





           
        </div>


             

        <div>
             <Panel
                 isOpen={isPanelOpen}
                 onDismiss={closePanel}
                headerText="Add Expense"
                closeButtonAriaLabel="Close"
                onRenderFooterContent={onRenderFooterContent}
                isFooterAtBottom={true}
                type={PanelType.medium}
               >
              <div className="row">
                {/* {expensedate and paymentmode} */}
                
                <div className="col-lg-6">
                  <div className="form-group m-2">
                  <h6>Expense Date</h6>
                  <TextField
                  type="date"
                  value={formdata.ExpenseDate}
                  onChange={(e,) => handleInputChange('ExpenseDate', e.currentTarget.value)}
                  required
                      errorMessage={!formdata?.ExpenseDate ? "expense date  is required" : ""}
                 />
                </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group m-2">
                  <h6>Payment Mode</h6>
                  <Dropdown
                    selectedKey={formdata.PaymentMode}
                    options={paymentModeOptions}
                    onChange={(e, option) => handleInputChange("PaymentMode", option?.key || "")}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </div>
                </div>
                
                <div className="col-lg-6">
                  <div className="form-group m-2">
                  <h6>Amount</h6>
                  <TextField
                    placeholder="Enter Amount"
                    type="number"
                    value={formdata.Amount !== undefined ? formdata.Amount.toString() : ""}
                    onChange={(e) => handleInputChange("Amount", Number(e.currentTarget.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                </div>
                <div className="col-lg-6">
                <div className="form-group m-2">
                  <h6>Amount Type</h6>
                  <TextField
                    disabled
                    value={formdata.AmountType}
                    style={{ width: '100%' }}
                  />
                </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group m-2">
                  <h6>Expense Type</h6>
                  <Dropdown
                    selectedKey={formdata.ExpenseType}
                    options={ExpenseTypeOptions}
                    onChange={(e, option) => handleInputChange("ExpenseType", option?.key || "")}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </div>
                </div>
                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <PrimaryButton styles={{ root: { marginRight: 8 } }} onClick={handleSaveTask}>
                    Save
                  </PrimaryButton>
                  <DefaultButton onClick={closePanel}>Cancel</DefaultButton>
                </div> */}
              </div>
                  </Panel>
          </div>
          
    </div>
        
    </>
  )
}

export default Expense2