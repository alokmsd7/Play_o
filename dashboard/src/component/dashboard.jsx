import React, { useState, useEffect } from "react";
import "./Customer.css";
import { axiosInstance } from "./axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { Edit, Delete, Search as SearchIcon, Sort } from "@material-ui/icons";

const STATUS_OPTIONS = ["Process", "Delivered", "Canceled"];

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    id: "",
    productName: "",
    customerName: "",
    date: "",
    amount: "",
    paymentMode: "",
    status: STATUS_OPTIONS[0], 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [sorting, setSorting] = useState({
    column: null,
    direction: "asc",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get("/api/getcustomers");
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value.trim().toLowerCase(); // Trim whitespace and convert to lowercase
    console.log("Search Query:", query); // Debugging statement
    setSearchQuery(query);
    const filtered = customers.filter((customer) => {
      if (!isNaN(query) && query !== '') { // Check if input is numeric
        return customer.id.toString().includes(query); // Search for ID
      } else {
        return (
          customer.customerName.toLowerCase().includes(query) // Search for customer name
        );
      }
    });
    console.log("Filtered Customers:", filtered); // Debugging statement
    setFilteredCustomers(filtered);
  };
  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (
      !newCustomerData.id ||
      !newCustomerData.productName ||
      !newCustomerData.customerName ||
      !newCustomerData.date ||
      !newCustomerData.amount ||
      !newCustomerData.paymentMode
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    const idExists = customers.some((customer) => customer.id === newCustomerData.id);
    if (idExists) {
      alert("Customer with the same ID already exists.");
      return;
    }
    try {
      await axiosInstance.post("/api/createcustomers", newCustomerData);
      fetchCustomers();
      setShowModal(false);
      setNewCustomerData({
        id: "",
        productName: "",
        customerName: "",
        date: "",
        amount: "",
        paymentMode: "",
        status: STATUS_OPTIONS[0], 
      });
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditCustomer = (customerId) => {
    console.log("Edit button clicked. Editing customer:", customerId);
    setShowModal(true);
    const customerToEdit = customers.find((customer) => customer.id === customerId);
    console.log("customerToEdit: " , customerToEdit)
    if (customerToEdit) {
      setEditingCustomer(customerToEdit);
      setEditMode(true);
      setNewCustomerData(customerToEdit);
    } else {
      console.log("Customer not found for editing");
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      await axiosInstance.put(`/api/updatecustomers/${editingCustomer.id}`, newCustomerData);
      fetchCustomers();
      setShowModal(false);
      setEditMode(false);
      setEditingCustomer(null);
      setNewCustomerData({
        id: "",
        productName: "",
        customerName: "",
        date: "",
        amount: "",
        paymentMode: "",
        status: STATUS_OPTIONS[0], 
      });
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  useEffect(() => {
    if (editingCustomer) {
      setNewCustomerData({ ...editingCustomer });
    }
  }, [editingCustomer]);

  const handleDeleteCustomer = async (customerId, index) => {
    try {
      await axiosInstance.delete(`/api/deletecustomers/${customerId}`);
      const updatedCustomers = [...customers];
      updatedCustomers.splice(index, 1);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleSort = (column) => {
    const isAsc = sorting.column === column && sorting.direction === "asc";
    setSorting({ column, direction: isAsc ? "desc" : "asc" });
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      if (column === "id" || column === "date") {
        return isAsc ? a[column] - b[column] : b[column] - a[column];
      } else {
        return isAsc ? a[column].localeCompare(b[column]) : b[column].localeCompare(a[column]);
      }
    });
    setFilteredCustomers(sortedCustomers);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusCellStyle = (status) => {
    let style = {
      backgroundColor: "orange",
      color: "white",
      padding: "5px 10px",
      borderRadius: "20px",
      display: "inline-block",
    };
    switch (status) {
      case "Delivered":
        style.backgroundColor = "green";
        break;
      case "Canceled":
        style.backgroundColor = "pink";
        break;
      default:
        style.backgroundColor = "orange";
        break;
    }
    return style;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCustomerData({
      id: "",
      productName: "",
      customerName: "",
      date: "",
      amount: "",
      paymentMode: "",
      status: STATUS_OPTIONS[0], 
    });
  };

  return (
    <div className="customer-container">
      <div className="search-container">
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchInputChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      

      <div className="but">
        <Button
          className="t2"
          variant="contained"
          color="secondary"
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
          }}
          style={{ marginBottom: "20px" }}
        >
          + Add Customer
        </Button>
      </div>
      <TableContainer component={Paper} style={{ marginTop: "20px" }} className="op">
        <div>
          <Table className="t">
            <TableHead className="TableHead">
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>
                  Tracking ID
                  <IconButton onClick={() => handleSort("id")}>
                    <Sort />
                  </IconButton>
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Product Name
                  <IconButton onClick={() => handleSort("productName")}>
                    <Sort />
                  </IconButton>
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Customer Name
                  <IconButton onClick={() => handleSort("customerName")}>
                    <Sort />
                  </IconButton>
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  Date
                  <IconButton onClick={() => handleSort("date")}>
                    <Sort />
                  </IconButton>
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Payment Mode</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filteredCustomers
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((customer, index) => (
      <TableRow
        key={customer.id}
        style={{
          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
        }}
      >
        <TableCell>{customer.id}</TableCell>
        <TableCell>{customer.productName}</TableCell>
        <TableCell>{customer.customerName}</TableCell>
        <TableCell>{customer.date}</TableCell>
        <TableCell>₹{customer.amount}</TableCell>
        <TableCell>{customer.paymentMode}</TableCell>
        <TableCell>
          <span style={getStatusCellStyle(customer.status)}>
            {customer.status}
          </span>
        </TableCell>
        <TableCell>
          <Button onClick={() => handleEditCustomer(customer.id)}>
            <Edit />
          </Button>
          <Button onClick={() => handleDeleteCustomer(customer.id, index)}>
            <Delete />
          </Button>
        </TableCell>
      </TableRow>
    ))}
</TableBody>

          </Table>
        </div>
      </TableContainer>

      <Modal open={showModal} onClose={handleCloseModal}>
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "25%",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>{editMode ? "Edit Customer" : "Add Customer"}</h2>
          <form onSubmit={editMode ? handleUpdateCustomer : handleAddCustomer}>
            <div>
              <TextField
                style={{ width: "100%", marginBottom: "10px" }}
                type="text"
                name="id"
                value={newCustomerData.id}
                onChange={handleInputChange}
                label="Tracking ID"
                required
              />
             <FormControl style={{ width: "100%", marginBottom: "10px" }}>
  <InputLabel htmlFor="product-name-select">Product Name</InputLabel>
  <Select
    style={{ width: "100%", marginBottom: "10px" }}
    name="productName"
    value={newCustomerData.productName}
    onChange={handleInputChange}
    label="Product Name"
    required
  >
    <MenuItem value="Hat">Hat</MenuItem>
    <MenuItem value="Laptop">Laptop</MenuItem>
    <MenuItem value="Phone">Phone</MenuItem>
    <MenuItem value="Bag">Bag</MenuItem>
    <MenuItem value="Headset">Headset</MenuItem>
    <MenuItem value="Mouse">Mouse</MenuItem>
    <MenuItem value="Clock">Clock</MenuItem>
    <MenuItem value="T-Shirt">T-Shirt</MenuItem>
    <MenuItem value="Monitor">Monitor</MenuItem>
    <MenuItem value="Keyboard">Keyboard</MenuItem>
  </Select>
</FormControl>


              <TextField
                style={{ width: "100%", marginBottom: "10px" }}
                type="text"
                name="customerName"
                value={newCustomerData.customerName}
                onChange={handleInputChange}
                label="Customer Name"
                required
              />
              <TextField
                style={{ width: "100%", marginBottom: "10px" }}
                type="date"
                name="date"
                value={newCustomerData.date}
                onChange={handleInputChange}
                required
              />
              <TextField
  style={{ width: "100%", marginBottom: "10px" }}
  type="number"
  name="amount"
  value={newCustomerData.amount}
  onChange={handleInputChange}
  label="Amount"
  required
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        ₹
      </InputAdornment>
    ),
  }}
/>

              <FormControl style={{ width: "100%", marginBottom: "10px" }}>
                <InputLabel htmlFor="payment-mode-select">Payment Mode</InputLabel>
                <Select
                  style={{ width: "100%" }}
                  name="paymentMode"
                  value={newCustomerData.paymentMode}
                  onChange={handleInputChange}
                  required
                  inputProps={{
                    id: "payment-mode-select",
                  }}
                >
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                </Select>
              </FormControl>
              <FormControl style={{ width: "100%", marginBottom: "10px" }}>
                <InputLabel htmlFor="status-select">Status</InputLabel>
                <Select
                  style={{ width: "100%" }}
                  name="status"
                  value={newCustomerData.status}
                  onChange={handleInputChange}
                  inputProps={{
                    id: "status-select",
                  }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                style={{ width: "100%", marginTop: "20px" }}
                type="submit"
                variant="contained"
                color="primary"
              >
                {editMode ? "Update" : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <div className="top-left-controls">
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
}

export default Customer;
