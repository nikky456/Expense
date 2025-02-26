import * as React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Web } from "sp-pnp-js";

import "./Style.css";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { DefaultButton, PrimaryButton, Dropdown, IDropdownOption, TextField,} from '@fluentui/react';
import { Panel, PanelType} from "@fluentui/react/lib/Panel";
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

const Expensetable = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState({ key: '', direction: '' });
  
  const [formdata, setFormdata] = React.useState({
    ExpenseDate:"",
    PaymentMode:"",
    ExpenseType:"",
    Amount:0,
    AmountType:"Expense"
  });
  const [filters, setFilters] = React.useState({
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
          "AmountType"
        )
        .top(4999)
        .get();
  
      const filteredData = res.filter((item: any) => item.AmountType === 'Expense');
  
      const formattedData = filteredData.map((item: any) => ({
        Id: item.Id, 
        ExpenseDate: item.ExpenseDate
          ? moment(item.ExpenseDate).format('DD/MM/YYYY')
          : null,
        PaymentMode: item.PaymentMode || 'N/A',
        ExpenseType: item.ExpenseType || 'N/A',
        Amount: item.Amount || 0,
      }));
  
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  React.useEffect(() => {
    fetchApidata();
  }, []);

  console.log("total data", data);

  const handleAddTask = async () => {
    setEditId(null);
    try {
      const postData = {
        ExpenseDate: formdata.ExpenseDate
        ? new Date(formdata.ExpenseDate).toISOString()
        : null,
        PaymentMode: formdata?.PaymentMode || "",
        Amount: formdata?.Amount || "",
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
            PaymentMode: formdata?.PaymentMode || "",
            Amount: formdata?.Amount || 0,
            ExpenseType: formdata?.ExpenseType || "",
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

  const handleFilterChange = (key:any, value:any) => {
    const defaultFilters = {
      ExpenseDate: "",
      PaymentMode: "",
      ExpenseType: "",
      Amount: 0,
      AmountType: "Expense"
    };
    setFilters({
      ...defaultFilters,
      [key]: value,
    });
  };

  
  const filteredData = data.filter((item) => {
    return (
     
      (!filters?.Amount || item?.Amount === Number(filters.Amount)) &&
      (!filters?.PaymentMode || item?.PaymentMode === filters.PaymentMode) &&
      (!filters?.ExpenseType || item?.ExpenseType === filters.ExpenseType)  
      
    )
  });
  
  
  const handleSort = (key:any) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setData(sortedData);
  };

  const handleInputChange = (field: keyof Expense, value: string | number) => {
    setFormdata((prev) => ({ ...prev, [field]: value }));
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


  return (
    <>
      <div className="bg">
        <h1 className="text-center  pt-3 text-light">Expense Table</h1>
        <div className="text-right mb-3 clearfix"
         style={{ marginTop: "-20px" }}>
          <button
            className="border-0 my-2  px-3 py-2 rounded-2 mx-3 pull-right btn btn-primary"
            
            onClick={handleNewTask}
          >
           Add
          </button>
        </div>
        <div
         style={{
       backgroundColor: 'white',
      }}
     >
      <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #ddd" }}>
  <thead>
    <tr>
      <td style={{ padding: "8px", border: "1px solid #ddd" }}>Serial No</td>
      <td style={{ padding: "8px", border: "1px solid #ddd" }}>Expense Date</td>
      {["Amount"].map((key) => (
        <td key={key} style={{ padding: "8px", border: "1px solid #ddd", position: "relative" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder={`Search ${key}`}
              style={{
                width: "100%",
                height: "40px",
                padding: "8px 35px 8px 10px",
                boxSizing: "border-box"
              }}
              onChange={(e) => handleFilterChange(key, e.target.value)}
            />
            <div style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <FaAngleUp style={{ cursor: "pointer", fontSize: "14px" }} onClick={() => handleSort(key)} />
              <FaAngleDown style={{ cursor: "pointer", marginTop: "3px", fontSize: "14px" }} onClick={() => handleSort(key)} />
            </div>
          </div>
        </td>
      ))}
      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
        <select
          style={{ width: "100%", height: "40px" }}
          value={filters.PaymentMode || ""}
          onChange={(e) => handleFilterChange("PaymentMode", e.target.value)}
        >
          <option value="">Search PaymentMode</option>
          <option value="UPI">UPI</option>
          <option value="NetBanking">NetBanking</option>
          <option value="Cash">Cash</option>
        </select>
      </td>
      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
        <select
          style={{ width: "100%", height: "40px" }}
          value={filters.ExpenseType || ""}
          onChange={(e) => handleFilterChange("ExpenseType", e.target.value)}
        >
          <option value="">Search ExpenseType</option>
          <option value="Electricity Bill">Electricity Bill</option>
          <option value="Salary">Salary</option>
          <option value="Equipment purchases and repairs">Equipment purchases and repairs</option>
          <option value="Cleaning Staff">Cleaning Staff</option>
          <option value="Others">Others</option>
        </select>
      </td>
      <td style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</td>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((item, index) => (
      <tr key={item.Id}>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{index + 1}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.ExpenseDate}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.Amount}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.PaymentMode}</td>
        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.ExpenseType}</td>
        <td style={{ padding: "10px", border: "1px solid #ddd" }}>
          <div className="d-flex">
            <span style={{ color: "green", cursor: "pointer", padding: "8px" }} onClick={() => handleEdit(item)}>
              <FaEdit />
            </span>
            <span style={{ color: "#ff0000", cursor: "pointer", padding: "8px" }} onClick={() => handleDelete(item.Id)}>
              <MdDelete />
            </span>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>


         

        </div>

        <Panel
     isOpen={isPanelOpen}
     onDismiss={closePanel}
    headerText="Add Expense"
    closeButtonAriaLabel="Close"
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
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
      <PrimaryButton styles={{ root: { marginRight: 8 } }} onClick={handleSaveTask}>
        Save
      </PrimaryButton>
      <DefaultButton onClick={closePanel}>Cancel</DefaultButton>
    </div>
  </div>
      </Panel>


      </div>
    </>
  );
};
export default Expensetable;
